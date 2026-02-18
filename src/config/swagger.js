const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'API RESTful para un sistema de ecommerce completo con autenticación, productos, carrito de compras, órdenes y pagos con Stripe',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.tudominio.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT en el formato: Bearer {token}',
        },
      },
      schemas: {
        // USER SCHEMAS
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // PRODUCT SCHEMAS
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
            },
            slug: {
              type: 'string',
              description: 'URL amigable del producto',
            },
            description: {
              type: 'string',
              description: 'Descripción del producto',
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Precio del producto',
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en inventario',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              description: 'URLs de imágenes del producto',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la categoría',
            },
            isActive: {
              type: 'boolean',
              description: 'Estado del producto',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // CATEGORY SCHEMAS
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              description: 'Nombre de la categoría',
            },
            slug: {
              type: 'string',
              description: 'URL amigable de la categoría',
            },
            description: {
              type: 'string',
              description: 'Descripción de la categoría',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // CART SCHEMAS
        CartItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'decimal',
            },
            image: {
              type: 'string',
              format: 'uri',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
            },
          },
        },

        Cart: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
            },
            itemCount: {
              type: 'integer',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ORDER SCHEMAS
        ShippingAddress: {
          type: 'object',
          required: ['street', 'city', 'state', 'zipCode', 'country'],
          properties: {
            street: {
              type: 'string',
              description: 'Calle y número',
            },
            city: {
              type: 'string',
              description: 'Ciudad',
            },
            state: {
              type: 'string',
              description: 'Estado o región',
            },
            zipCode: {
              type: 'string',
              description: 'Código postal',
            },
            country: {
              type: 'string',
              description: 'País',
            },
          },
        },

        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            productId: {
              type: 'string',
              format: 'uuid',
            },
            quantity: {
              type: 'integer',
            },
            unitPrice: {
              type: 'number',
              format: 'decimal',
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
            },
            product: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                },
                name: {
                  type: 'string',
                },
                slug: {
                  type: 'string',
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'uri',
                  },
                },
              },
            },
          },
        },

        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            orderNumber: {
              type: 'string',
              description: 'Número único de orden',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              description: 'Estado de la orden',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Estado del pago',
            },
            shippingAddress: {
              $ref: '#/components/schemas/ShippingAddress',
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales',
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
            },
            shippingCost: {
              type: 'number',
              format: 'decimal',
            },
            tax: {
              type: 'number',
              format: 'decimal',
            },
            total: {
              type: 'number',
              format: 'decimal',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            paidAt: {
              type: 'string',
              format: 'date-time',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ERROR SCHEMAS
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error',
            },
          },
        },

        ValidationError: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de autenticación faltante o inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'No tienes permisos para realizar esta acción',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación',
      },
      {
        name: 'Products',
        description: 'Gestión de productos',
      },
      {
        name: 'Categories',
        description: 'Gestión de categorías',
      },
      {
        name: 'Cart',
        description: 'Carrito de compras',
      },
      {
        name: 'Orders',
        description: 'Gestión de órdenes',
      },
      {
        name: 'Payments',
        description: 'Procesamiento de pagos con Stripe',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Archivos que contienen las anotaciones
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;