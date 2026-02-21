import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing seed data (order matters due to foreign keys)
  await prisma.application.deleteMany({});
  await prisma.propertyView.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.swipe.deleteMany({});
  await prisma.roommateProfile.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});
  console.log('  Cleaned existing data');

  // Hash default password for all test users
  const defaultPassword = await bcrypt.hash('password123', 12);

  // Create test users (upsert to handle existing)
  const user1 = await prisma.user.upsert({
    where: { email: 'julian@test.com' },
    update: { password: defaultPassword, firstName: 'Julian', lastName: 'Salamanca', bio: 'Desarrollador buscando apartamento en Bogota', seekingMode: 'TENANT' },
    create: {
      cognitoSub: 'cognito-sub-001',
      email: 'julian@test.com',
      firstName: 'Julian',
      lastName: 'Salamanca',
      password: defaultPassword,
      bio: 'Desarrollador buscando apartamento en Bogota',
      seekingMode: 'TENANT',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@test.com' },
    update: { password: defaultPassword, firstName: 'Maria', lastName: 'Garcia', bio: 'Arrendadora con propiedades en Chapinero y Usaquen', seekingMode: 'NONE' },
    create: {
      cognitoSub: 'cognito-sub-002',
      email: 'maria@test.com',
      firstName: 'Maria',
      lastName: 'Garcia',
      password: defaultPassword,
      bio: 'Arrendadora con propiedades en Chapinero y Usaquen',
      seekingMode: 'NONE',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'carlos@test.com' },
    update: { password: defaultPassword, firstName: 'Carlos', lastName: 'Lopez', bio: 'Estudiante universitario buscando compañero de cuarto', seekingMode: 'ROOMMATE' },
    create: {
      cognitoSub: 'cognito-sub-003',
      email: 'carlos@test.com',
      firstName: 'Carlos',
      lastName: 'Lopez',
      password: defaultPassword,
      bio: 'Estudiante universitario buscando compañero de cuarto',
      seekingMode: 'ROOMMATE',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'ana@test.com' },
    update: { password: defaultPassword, firstName: 'Ana', lastName: 'Rodriguez', bio: 'Profesional joven buscando compartir apartamento', seekingMode: 'ROOMMATE' },
    create: {
      cognitoSub: 'cognito-sub-004',
      email: 'ana@test.com',
      firstName: 'Ana',
      lastName: 'Rodriguez',
      password: defaultPassword,
      bio: 'Profesional joven buscando compartir apartamento',
      seekingMode: 'ROOMMATE',
    },
  });

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      ownerId: user2.id,
      title: 'Hermoso apartamento en Chapinero Alto',
      description:
        'Amplio apartamento de 3 habitaciones con vista a los cerros orientales. Incluye parqueadero y deposito. Zona tranquila cerca a centros comerciales y transporte publico.',
      propertyType: 'APARTMENT',
      listingType: 'RENT',
      price: 2500000,
      currency: 'COP',
      bedrooms: 3,
      bathrooms: 2,
      area: 85,
      address: 'Calle 63 #7-20',
      city: 'Bogota',
      neighborhood: 'Chapinero Alto',
      department: 'Bogota D.C.',
      latitude: 4.6486,
      longitude: -74.0628,
      amenities: ['wifi', 'parking', 'security', 'elevator', 'hot_water'],
    },
  });

  const property2 = await prisma.property.create({
    data: {
      ownerId: user2.id,
      title: 'Estudio moderno en Usaquen',
      description:
        'Estudio completamente amoblado y equipado en la mejor zona de Usaquen. Perfecto para profesionales independientes. A dos cuadras del parque de Usaquen.',
      propertyType: 'STUDIO',
      listingType: 'RENT',
      price: 1800000,
      currency: 'COP',
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      address: 'Carrera 6 #119-12',
      city: 'Bogota',
      neighborhood: 'Usaquen',
      department: 'Bogota D.C.',
      latitude: 4.6952,
      longitude: -74.0308,
      amenities: ['wifi', 'furnished', 'security', 'hot_water', 'laundry'],
    },
  });

  await prisma.property.create({
    data: {
      ownerId: user1.id,
      title: 'Casa familiar en Envigado',
      description:
        'Hermosa casa de dos pisos con jardin y terraza. Barrio tranquilo y familiar. Cerca a colegios y supermercados. Ideal para familias.',
      propertyType: 'HOUSE',
      listingType: 'SALE',
      price: 450000000,
      currency: 'COP',
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      address: 'Calle 38 Sur #27-15',
      city: 'Medellin',
      neighborhood: 'Envigado',
      department: 'Antioquia',
      latitude: 6.1673,
      longitude: -75.5843,
      amenities: ['parking', 'pets_allowed', 'balcony', 'hot_water'],
    },
  });

  // Create roommate profiles
  await prisma.roommateProfile.create({
    data: {
      userId: user3.id,
      budget: 800000,
      preferredCity: 'Bogota',
      preferredNeighborhoods: ['Chapinero', 'Teusaquillo', 'La Candelaria'],
      bio: 'Estudiante de ingenieria, tranquilo y ordenado. Me gustan los videojuegos y cocinar.',
      occupation: 'Estudiante',
      age: 22,
      lifestyle: {
        smoking: false,
        pets: false,
        schedule: 'night_owl',
        cleanliness: 'clean',
        guests: 'sometimes',
      },
    },
  });

  await prisma.roommateProfile.create({
    data: {
      userId: user4.id,
      budget: 1200000,
      preferredCity: 'Bogota',
      preferredNeighborhoods: ['Chapinero', 'Usaquen', 'Cedritos'],
      bio: 'Diseñadora grafica, me gusta el yoga y salir a correr los fines de semana.',
      occupation: 'Diseñadora',
      age: 26,
      lifestyle: {
        smoking: false,
        pets: true,
        schedule: 'early_bird',
        cleanliness: 'very_clean',
        guests: 'rarely',
      },
    },
  });

  // Create some ratings
  await prisma.rating.create({
    data: {
      raterId: user1.id,
      ratedUserId: user2.id,
      context: 'LANDLORD',
      score: 5,
      comment: 'Excelente arrendadora, muy responsable y atenta con el mantenimiento.',
    },
  });

  await prisma.rating.create({
    data: {
      raterId: user2.id,
      ratedUserId: user1.id,
      context: 'TENANT',
      score: 4,
      comment: 'Buen inquilino, siempre paga a tiempo.',
    },
  });

  // Create a property view
  await prisma.propertyView.create({
    data: {
      userId: user1.id,
      propertyId: property1.id,
    },
  });

  // Create an application
  await prisma.application.create({
    data: {
      propertyId: property2.id,
      applicantId: user1.id,
      message: 'Hola, me interesa mucho el estudio. Soy profesional y tengo referencias.',
      status: 'PENDING',
    },
  });

  console.log('Seed data created successfully!');
  console.log(`  Users: ${user1.email}, ${user2.email}, ${user3.email}, ${user4.email}`);
  console.log('  Default password for all users: password123');
  console.log(`  Properties: ${property1.title}, ${property2.title}`);
  console.log('  Roommate profiles: 2');
  console.log('  Ratings: 2');
  console.log('  Property views: 1');
  console.log('  Applications: 1');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
