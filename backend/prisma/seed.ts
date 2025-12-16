import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding achievements...');
  await prisma.achievement.deleteMany(); // Delete existing achievements
  await prisma.achievement.createMany({
    data: [
      { name: 'Bits 1', description: 'Dona exactamente 1 bit', points: 1, category: 'Support', isRepeatable: true },
      { name: 'Bits 10', description: 'Dona exactamente 10 bits', points: 10, category: 'Support', isRepeatable: true },
      { name: 'Bits 25', description: 'Dona exactamente 25 bits', points: 25, category: 'Support', isRepeatable: true },
      { name: 'Bits 100', description: 'Dona exactamente 100 bits', points: 100, category: 'Support', isRepeatable: true },
      { name: 'Bits 200', description: 'Dona exactamente 200 bits', points: 200, category: 'Support', isRepeatable: true },
      { name: 'Bits 500', description: 'Dona exactamente 500 bits', points: 500, category: 'Support', isRepeatable: true },
      { name: 'Chat 1 Mensaje', description: 'Al enviar tu primer mensaje en el canal', points: 1, category: 'Chat' },
      { name: 'Chat 10 Mensajes', description: 'Al acumular 10 mensajes en el canal', points: 10, category: 'Chat' },
      { name: 'Chat 100 Mensajes', description: 'Al acumular 100 mensajes en el canal', points: 20, category: 'Chat' },
      { name: 'Chat 1000 Mensajes', description: 'Al acumular 1000 mensajes en el canal', points: 100, category: 'Chat' },
      { name: 'Chat 10000 Mensajes', description: 'Al acumular 10000 mensajes en el canal', points: 250, category: 'Chat' },
      { name: 'Chat 100000 Mensajes', description: 'Al acumular 100000 mensajes en el canal', points: 600, category: 'Chat' },
      { name: 'Chat 1000000 Mensajes', description: 'Al acumular 1 000 000 mensajes en el canal', points: 1200, category: 'Chat' },
      { name: 'Chat 10000000 Mensajes', description: 'Al acumular 10 000 000 mensajes en el canal', points: 1700, category: 'Chat' },
      { name: 'Chat 100000000 Mensajes', description: 'Al acumular 100 000 000 mensajes en el canal', points: 2000, category: 'Chat' },
      { name: 'Chat 5 Mensajes', description: 'Al acumular 5 mensajes en el canal', points: 5, category: 'Chat' },
      { name: 'Chat 50 Mensajes', description: 'Al acumular 50 mensajes en el canal', points: 15, category: 'Chat' },
      { name: 'Chat 500 Mensajes', description: 'Al acumular 500 mensajes en el canal', points: 60, category: 'Chat' },
      { name: 'Chat 5000 Mensajes', description: 'Al acumular 5000 mensajes en el canal', points: 180, category: 'Chat' },
      { name: 'Chat 50000 Mensajes', description: 'Al acumular 50000 mensajes en el canal', points: 400, category: 'Chat' },
      { name: 'Chat 500000 Mensajes', description: 'Al acumular 500000 mensajes en el canal', points: 900, category: 'Chat' },
      { name: 'Chat 5000000 Mensajes', description: 'Al acumular 5 000 000 mensajes en el canal', points: 1500, category: 'Chat' },
      { name: 'Chat 50000000 Mensajes', description: 'Al acumular 50 000 000 mensajes en el canal', points: 1900, category: 'Chat' },
      { name: 'Chat Nocturno', description: 'Envía mensaje entre 2-6 AM (hora canal)', points: 15, category: 'Chat' },
      { name: 'Donador', description: 'Acumula +500 bits totales', points: 200, category: 'Support' },
      { name: 'Donador Epico', description: 'Acumula +2000 bits totales', points: 1000, category: 'Support' },
      { name: 'Donador Legendario', description: 'Acumula +5000 bits totales', points: 2000, category: 'Support' },
      { name: 'Donador Raro', description: 'Acumula +1000 bits totales', points: 500, category: 'Support' },
      { name: 'Emote 1', description: 'Usa tu primer emote/emoji en chat', points: 1, category: 'Chat' },
      { name: 'Emote 10', description: 'Acumula 10 emotes/emojis usados', points: 10, category: 'Chat' },
      { name: 'Emote 100', description: 'Acumula 100 emotes/emojis usados', points: 45, category: 'Chat' },
      { name: 'Emote 1000', description: 'Acumula 1000 emotes/emojis usados', points: 200, category: 'Chat' },
      { name: 'Emote 10000', description: 'Acumula 10000 emotes/emojis usados', points: 500, category: 'Chat' },
      { name: 'Emote 100000', description: 'Acumula 100000 emotes/emojis usados', points: 1100, category: 'Chat' },
      { name: 'Emote 1000000', description: 'Acumula 1 000 000 emotes/emojis usados', points: 1700, category: 'Chat' },
      { name: 'Emote 10000000', description: 'Acumula 10 000 000 emotes/emojis usados', points: 2000, category: 'Chat' },
      { name: 'Emote 25', description: 'Acumula 25 emotes/emojis usados', points: 15, category: 'Chat' },
      { name: 'Emote 250', description: 'Acumula 250 emotes/emojis usados', points: 70, category: 'Chat' },
      { name: 'Emote 5', description: 'Acumula 5 emotes/emojis usados', points: 5, category: 'Chat' },
      { name: 'Emote 50', description: 'Acumula 50 emotes/emojis usados', points: 25, category: 'Chat' },
      { name: 'Emote 500', description: 'Acumula 500 emotes/emojis usados', points: 120, category: 'Chat' },
      { name: 'Emote 5000', description: 'Acumula 5000 emotes/emojis usados', points: 350, category: 'Chat' },
      { name: 'Emote 50000', description: 'Acumula 50000 emotes/emojis usados', points: 800, category: 'Chat' },
      { name: 'Emote 500000', description: 'Acumula 500000 emotes/emojis usados', points: 1400, category: 'Chat' },
      { name: 'Emote 5000000', description: 'Acumula 5 000 000 emotes/emojis usados', points: 1900, category: 'Chat' },
      { name: 'Primer Clip Creado', description: 'Crea tu primer clip del stream', points: 30, category: 'Content' },
      { name: 'Primer Follow', description: 'Sigue el canal por primera vez', points: 20, category: 'Social' },
      { name: 'Primer Mensaje', description: 'Envía tu primer mensaje en chat', points: 10, category: 'Chat' },
      { name: 'Primer Raid Enviado', description: 'Raidea el canal desde tu cuenta', points: 25, category: 'Social' },
      { name: 'Primer Sub', description: 'Suscríbete al canal', points: 30, category: 'Support' },
      { name: 'Regalo', description: 'Regala subs a 5+ viewers', points: 75, category: 'Support', isRepeatable: true },
      { name: 'Regalo Grande', description: 'Regala subs a 10+ viewers', points: 150, category: 'Support', isRepeatable: true },
      { name: 'Regalo Enorme', description: 'Regala subs a 15+ viewers', points: 225, category: 'Support', isRepeatable: true },
      { name: 'Regalo Masivo', description: 'Regala subs a 20+ viewers', points: 300, category: 'Support', isRepeatable: true },
      { name: 'Regalo Colosal', description: 'Regala subs a 25+ viewers', points: 375, category: 'Support', isRepeatable: true },
      { name: 'Resubscripción', description: 'Renueva tu suscripción', points: 50, category: 'Support', isRepeatable: true },
      { name: 'Sub Gift 1', description: 'Regala tu primera sub a un viewer', points: 40, category: 'Support' },
    ],
  });

  console.log('Seeding rewards...');
  await prisma.reward.deleteMany(); // Delete existing rewards
  await prisma.reward.createMany({
    data: [
      { name: 'Añade Efecto Pixel', description: 'Toda la pantalla se vuelve pixelada por 5 mins', cost: 150 },
      { name: 'Pantalla invertida', description: 'Voltear imagen stream 5 min', cost: 200 },
      { name: 'Música random', description: 'Poner canción elegida por el chat (duracion max. 10 min)', cost: 250 },
      { name: 'Cambio de escena', description: 'Cambiar overlay gracioso 5 min', cost: 300 },
      { name: 'Apagon', description: 'Pantalla negra 5 min (con audio)', cost: 400 },
      { name: 'Stream muted', description: 'Sin micrófono 10 min (solo video)', cost: 500 },
      { name: 'Toma de control', description: 'Chat elige tema conversación', cost: 600 },
      { name: 'Añade recompensa', description: 'Añade una recompensa (estará disponible para el próximo Stream)', cost: 800 },
      { name: 'Reaccionar video', description: 'Ver y reaccionar video elegido por chat (duracion max. 30 min)', cost: 1000 },
      { name: 'Elegir película', description: 'Chat elige película para ver juntos', cost: 1500 },
      { name: 'Apagon Total', description: 'Reinicio stream 2 min (preparado)', cost: 2000 },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });