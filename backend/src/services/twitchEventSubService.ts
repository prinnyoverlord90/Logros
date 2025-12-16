import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as userService from './userService';
import * as achievementService from './achievementService';
import * as pointTransactionService from './pointTransactionService';

const prisma = new PrismaClient();

// Variable para trackear inicio de stream
let streamStartTime: Date | null = null;

// Map para trackear regalos masivos
const massGifts = new Map<string, { count: number; timestamp: number }>();

const MASS_GIFT_WINDOW = 10000; // 10 seconds

// Verificar firma de webhook
function verifySignature(req: Request, secret: string): boolean {
  const signature = req.headers['twitch-eventsub-message-signature'] as string;
  const messageId = req.headers['twitch-eventsub-message-id'] as string;
  const timestamp = req.headers['twitch-eventsub-message-timestamp'] as string;
  const body = JSON.stringify(req.body);

  const message = messageId + timestamp + body;
  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', secret).update(message).digest('hex');

  return signature === expectedSignature;
}

export const handleTwitchWebhook = async (req: Request, res: Response) => {
  const secret = process.env.WEBHOOK_SECRET!;
  if (!verifySignature(req, secret)) {
    return res.status(403).send('Forbidden');
  }

  const { subscription, event } = req.body;

  const broadcasterId = process.env.TWITCH_BROADCASTER_ID || 'tu_broadcaster_id';

  if (subscription.type === 'channel.subscribe') {
    // Nuevo sub o resub
    const userId = event.user_id;
    const username = event.user_login;
    const cumulativeMonths = event.cumulative_months;

    let user = await userService.getUserByTwitchId(userId);
    if (!user) {
      user = await userService.createUser({ twitchId: userId, username });
    }

    if (cumulativeMonths === 1) {
      // Nuevo sub
      await achievementService.assignAchievementToUser(user.id, 'Primer Sub');
    } else {
      // Resub
      await achievementService.assignAchievementToUser(user.id, 'Resubscripción');
    }

    if (event.is_gift) {
      // Award to gifter
      const gifterId = event.gifter_user_id;
      const gifterUsername = event.gifter_user_login;
      let gifter = await userService.getUserByTwitchId(gifterId);
      if (!gifter) {
        gifter = await userService.createUser({ twitchId: gifterId, username: gifterUsername });
      }

      // Track mass gifts
      const now = Date.now();
      const existing = massGifts.get(gifterId);
      if (existing && (now - existing.timestamp) < MASS_GIFT_WINDOW) {
        existing.count += 1;
        existing.timestamp = now;
      } else {
        massGifts.set(gifterId, { count: 1, timestamp: now });
      }

      const giftCount = massGifts.get(gifterId)!.count;

      // Award Sub Gift 1 if first
      if (giftCount === 1) {
        const hasSubGift1 = await achievementService.userHasAchievement(gifter.id, 'Sub Gift 1');
        if (!hasSubGift1) {
          await achievementService.assignAchievementToUser(gifter.id, 'Sub Gift 1');
        }
      }

      // Award mass gifts
      if (giftCount >= 5) {
        await achievementService.assignAchievementToUser(gifter.id, 'Regalo');
      }
      if (giftCount >= 10) {
        await achievementService.assignAchievementToUser(gifter.id, 'Regalo Grande');
      }
      if (giftCount >= 15) {
        await achievementService.assignAchievementToUser(gifter.id, 'Regalo Enorme');
      }
      if (giftCount >= 20) {
        await achievementService.assignAchievementToUser(gifter.id, 'Regalo Masivo');
      }
      if (giftCount >= 25) {
        await achievementService.assignAchievementToUser(gifter.id, 'Regalo Colosal');
      }
    }
  } else if (subscription.type === 'channel.follow') {
    // Nuevo follow
    const userId = event.user_id;
    const username = event.user_login;

    let user = await userService.getUserByTwitchId(userId);
    if (!user) {
      user = await userService.createUser({ twitchId: userId, username });
    }

    await achievementService.assignAchievementToUser(user.id, 'Primer Follow');
  } else if (subscription.type === 'channel.cheer') {
    // Bits donados
    const userId = event.user_id;
    const username = event.user_login;
    const bits = event.bits;

    let user = await userService.getUserByTwitchId(userId);
    if (!user) {
      user = await userService.createUser({ twitchId: userId, username });
    }

    // Record bits transaction
    await pointTransactionService.createTransaction({ userId: user.id, type: 'bits', amount: bits, reason: 'Bits donados' });

    // Otorgar logro por cantidad exacta de bits
    if (bits === 1) {
      await achievementService.assignAchievementToUser(user.id, 'Bits 1');
    } else if (bits === 10) {
      await achievementService.assignAchievementToUser(user.id, 'Bits 10');
    } else if (bits === 25) {
      await achievementService.assignAchievementToUser(user.id, 'Bits 25');
    } else if (bits === 100) {
      await achievementService.assignAchievementToUser(user.id, 'Bits 100');
    } else if (bits === 200) {
      await achievementService.assignAchievementToUser(user.id, 'Bits 200');
    } else if (bits === 500) {
      await achievementService.assignAchievementToUser(user.id, 'Bits 500');
    }

    // Check for accumulated bits
    const totalBits = await pointTransactionService.getTotalBitsForUser(user.id);
    if (totalBits >= 500) {
      await achievementService.assignAchievementToUser(user.id, 'Donador');
    }
    if (totalBits >= 1000) {
      await achievementService.assignAchievementToUser(user.id, 'Donador Raro');
    }
    if (totalBits >= 2000) {
      await achievementService.assignAchievementToUser(user.id, 'Donador Epico');
    }
    if (totalBits >= 5000) {
      await achievementService.assignAchievementToUser(user.id, 'Donador Legendario');
    }
  } else if (subscription.type === 'channel.clip') {
    // Clip creado
    const userId = event.user_id;
    const username = event.user_login;

    let user = await userService.getUserByTwitchId(userId);
    if (!user) {
      user = await userService.createUser({ twitchId: userId, username });
    }

    await achievementService.assignAchievementToUser(user.id, 'Primer Clip Creado');
  } else if (subscription.type === 'channel.raid') {
    // Raid recibido
    const raiderId = event.from_broadcaster_user_id;
    const raiderUsername = event.from_broadcaster_user_login;
    let raider = await userService.getUserByTwitchId(raiderId);
    if (!raider) {
      raider = await userService.createUser({ twitchId: raiderId, username: raiderUsername });
    }
    await achievementService.assignAchievementToUser(raider.id, 'Primer Raid Enviado');
  } else if (subscription.type === 'channel.prediction.end') {
    // Predicción resuelta - removed
  } else if (subscription.type === 'stream.online') {
    // Stream empezado - removed
  } else if (subscription.type === 'stream.offline') {
    // Stream terminado - removed
  }

  res.status(200).send('OK');
};

// Función para suscribirse a eventos (llamar manualmente o en startup)
export const subscribeToEvents = async () => {
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
  const webhookUrl = process.env.WEBHOOK_URL || 'https://your-ngrok-url.ngrok.io/webhooks/twitch'; // Cambiar por tu URL pública
  const broadcasterId = process.env.TWITCH_BROADCASTER_ID || 'tu_broadcaster_id';

  // Obtener access token
  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Suscribirse a sub
  await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'channel.subscribe',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId }, // Reemplazar con tu user ID
      transport: {
        method: 'webhook',
        callback: webhookUrl,
        secret: process.env.WEBHOOK_SECRET
      }
    })
  });

  // Suscribirse a cheer
  await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'channel.cheer',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
      transport: {
        method: 'webhook',
        callback: webhookUrl,
        secret: process.env.WEBHOOK_SECRET
      }
    })
  });

  // Suscribirse a follow
  await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'channel.follow',
      version: '2',
      condition: { broadcaster_user_id: 'tu_broadcaster_id' },
      transport: {
        method: 'webhook',
        callback: webhookUrl,
        secret: process.env.WEBHOOK_SECRET
      }
    })
  });

  // Suscribirse a clip
  await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'channel.clip',
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
      transport: {
        method: 'webhook',
        callback: webhookUrl,
        secret: process.env.WEBHOOK_SECRET
      }
    })
  });

  // Suscribirse a raid
  await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'channel.raid',
      version: '1',
      condition: { to_broadcaster_user_id: broadcasterId },
      transport: {
        method: 'webhook',
        callback: webhookUrl,
        secret: process.env.WEBHOOK_SECRET
      }
    })
  });

  // Suscribirse a prediction end - removed

  // Suscribirse a stream online - removed
  // Suscribirse a stream offline - removed
};