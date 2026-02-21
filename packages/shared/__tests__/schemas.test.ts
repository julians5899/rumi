import {
  createPropertySchema,
  propertyFiltersSchema,
  updateUserSchema,
  updateSeekingModeSchema,
  createRoommateProfileSchema,
  recordSwipeSchema,
  sendMessageSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
  createRatingSchema,
  recordPropertyViewSchema,
} from '../src/schemas';

describe('Property Schemas', () => {
  describe('createPropertySchema', () => {
    const validProperty = {
      title: 'Apartamento en Chapinero',
      description: 'Hermoso apartamento de 3 habitaciones en el corazon de Chapinero',
      propertyType: 'APARTMENT' as const,
      listingType: 'RENT' as const,
      price: 2500000,
      bedrooms: 3,
      bathrooms: 2,
      address: 'Calle 53 #13-40',
      city: 'Bogota',
      department: 'Bogota D.C.',
    };

    it('should validate a correct property', () => {
      const result = createPropertySchema.safeParse(validProperty);
      expect(result.success).toBe(true);
    });

    it('should reject a property with title too short', () => {
      const result = createPropertySchema.safeParse({ ...validProperty, title: 'Ab' });
      expect(result.success).toBe(false);
    });

    it('should reject a property with negative price', () => {
      const result = createPropertySchema.safeParse({ ...validProperty, price: -100 });
      expect(result.success).toBe(false);
    });

    it('should reject an invalid property type', () => {
      const result = createPropertySchema.safeParse({ ...validProperty, propertyType: 'CASTLE' });
      expect(result.success).toBe(false);
    });

    it('should default amenities to empty array', () => {
      const result = createPropertySchema.safeParse(validProperty);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amenities).toEqual([]);
      }
    });

    it('should accept optional fields', () => {
      const result = createPropertySchema.safeParse({
        ...validProperty,
        area: 85.5,
        neighborhood: 'Chapinero Alto',
        latitude: 4.6486,
        longitude: -74.0628,
        amenities: ['wifi', 'parking', 'gym'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('propertyFiltersSchema', () => {
    it('should accept empty filters with defaults', () => {
      const result = propertyFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should coerce string numbers from query params', () => {
      const result = propertyFiltersSchema.safeParse({
        minPrice: '1000000',
        page: '2',
        limit: '10',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minPrice).toBe(1000000);
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject limit over 50', () => {
      const result = propertyFiltersSchema.safeParse({ limit: 100 });
      expect(result.success).toBe(false);
    });
  });
});

describe('User Schemas', () => {
  describe('updateUserSchema', () => {
    it('should validate a correct user update', () => {
      const result = updateUserSchema.safeParse({
        firstName: 'Julian',
        lastName: 'Salamanca',
        phone: '+573001234567',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty first name', () => {
      const result = updateUserSchema.safeParse({
        firstName: '',
        lastName: 'Salamanca',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateSeekingModeSchema', () => {
    it('should accept valid seeking modes', () => {
      expect(updateSeekingModeSchema.safeParse({ seekingMode: 'NONE' }).success).toBe(true);
      expect(updateSeekingModeSchema.safeParse({ seekingMode: 'TENANT' }).success).toBe(true);
      expect(updateSeekingModeSchema.safeParse({ seekingMode: 'ROOMMATE' }).success).toBe(true);
    });

    it('should reject invalid seeking mode', () => {
      expect(updateSeekingModeSchema.safeParse({ seekingMode: 'BOTH' }).success).toBe(false);
    });
  });
});

describe('Roommate Schemas', () => {
  describe('createRoommateProfileSchema', () => {
    it('should validate a correct profile', () => {
      const result = createRoommateProfileSchema.safeParse({
        budget: 800000,
        preferredCity: 'Bogota',
        bio: 'Estudiante de ingenieria buscando compañero tranquilo',
        age: 24,
        lifestyle: {
          smoking: false,
          pets: true,
          schedule: 'early_bird',
          cleanliness: 'clean',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject age under 18', () => {
      const result = createRoommateProfileSchema.safeParse({
        budget: 800000,
        preferredCity: 'Bogota',
        age: 16,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('recordSwipeSchema', () => {
    it('should accept LIKE and PASS actions', () => {
      const like = recordSwipeSchema.safeParse({
        candidateId: '550e8400-e29b-41d4-a716-446655440000',
        action: 'LIKE',
      });
      const pass = recordSwipeSchema.safeParse({
        candidateId: '550e8400-e29b-41d4-a716-446655440000',
        action: 'PASS',
      });
      expect(like.success).toBe(true);
      expect(pass.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const result = recordSwipeSchema.safeParse({
        candidateId: '550e8400-e29b-41d4-a716-446655440000',
        action: 'SUPERLIKE',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Message Schemas', () => {
  describe('sendMessageSchema', () => {
    it('should validate a correct message', () => {
      const result = sendMessageSchema.safeParse({ content: 'Hola, me interesa el apartamento!' });
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const result = sendMessageSchema.safeParse({ content: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Application Schemas', () => {
  describe('createApplicationSchema', () => {
    it('should validate a correct application', () => {
      const result = createApplicationSchema.safeParse({
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        message: 'Me gustaria aplicar para este apartamento',
      });
      expect(result.success).toBe(true);
    });

    it('should accept application without message', () => {
      const result = createApplicationSchema.safeParse({
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateApplicationStatusSchema', () => {
    it('should accept ACCEPTED and REJECTED', () => {
      expect(updateApplicationStatusSchema.safeParse({ status: 'ACCEPTED' }).success).toBe(true);
      expect(updateApplicationStatusSchema.safeParse({ status: 'REJECTED' }).success).toBe(true);
    });

    it('should reject PENDING as an update status', () => {
      expect(updateApplicationStatusSchema.safeParse({ status: 'PENDING' }).success).toBe(false);
    });
  });
});

describe('Rating Schemas', () => {
  describe('createRatingSchema', () => {
    it('should validate a correct rating', () => {
      const result = createRatingSchema.safeParse({
        ratedUserId: '550e8400-e29b-41d4-a716-446655440000',
        context: 'LANDLORD',
        score: 4,
        comment: 'Excelente arrendador, muy responsable',
      });
      expect(result.success).toBe(true);
    });

    it('should accept all three contexts', () => {
      const base = {
        ratedUserId: '550e8400-e29b-41d4-a716-446655440000',
        score: 5,
      };
      expect(createRatingSchema.safeParse({ ...base, context: 'LANDLORD' }).success).toBe(true);
      expect(createRatingSchema.safeParse({ ...base, context: 'TENANT' }).success).toBe(true);
      expect(createRatingSchema.safeParse({ ...base, context: 'ROOMMATE' }).success).toBe(true);
    });

    it('should reject score outside 1-5', () => {
      const base = {
        ratedUserId: '550e8400-e29b-41d4-a716-446655440000',
        context: 'TENANT' as const,
      };
      expect(createRatingSchema.safeParse({ ...base, score: 0 }).success).toBe(false);
      expect(createRatingSchema.safeParse({ ...base, score: 6 }).success).toBe(false);
    });

    it('should accept rating without comment', () => {
      const result = createRatingSchema.safeParse({
        ratedUserId: '550e8400-e29b-41d4-a716-446655440000',
        context: 'ROOMMATE',
        score: 3,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('Property View Schema', () => {
  describe('recordPropertyViewSchema', () => {
    it('should validate a correct property view', () => {
      const result = recordPropertyViewSchema.safeParse({
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = recordPropertyViewSchema.safeParse({ propertyId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });
  });
});
