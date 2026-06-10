import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const PRODUCTOS = [
  {
    question: '¿Cuál es la cobertura principal del seguro agrícola?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Heladas', isCorrect: false, order: 0 },
      { text: 'Incendio', isCorrect: false, order: 1 },
      { text: 'Granizo', isCorrect: true, order: 2 },
      { text: 'Sequía', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué fenómeno cubre el seguro agrícola cuando daña directamente los cultivos?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Inundación', isCorrect: false, order: 0 },
      { text: 'Granizo', isCorrect: true, order: 1 },
      { text: 'Sequía', isCorrect: false, order: 2 },
      { text: 'Terremoto', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estas coberturas adicionales se ofrece en un seguro agrícola?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Robo', isCorrect: false, order: 0 },
      { text: 'Heladas', isCorrect: true, order: 1 },
      { text: 'Responsabilidad Civil', isCorrect: false, order: 2 },
      { text: 'Cristales', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué cultivo está cubierto por el seguro agrícola?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Soja', isCorrect: true, order: 0 },
      { text: 'Limón', isCorrect: false, order: 1 },
      { text: 'Manzana', isCorrect: false, order: 2 },
      { text: 'Vid', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué sistema utiliza Triunfo para cotizar seguros agrícolas?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'AgroNet', isCorrect: false, order: 0 },
      { text: 'Triunfo Net', isCorrect: true, order: 1 },
      { text: 'AgroWeb', isCorrect: false, order: 2 },
      { text: 'Campo Seguro', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué protege el seguro Bolso?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'El automóvil', isCorrect: false, order: 0 },
      { text: 'El hogar', isCorrect: false, order: 1 },
      { text: 'El bolso y su contenido', isCorrect: true, order: 2 },
      { text: 'La bicicleta', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estos elementos está cubierto dentro de la cobertura Bolso Protegido?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Celular', isCorrect: true, order: 0 },
      { text: 'Televisor', isCorrect: false, order: 1 },
      { text: 'Notebook empresarial', isCorrect: false, order: 2 },
      { text: 'Heladera', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Desde qué edad se puede contratar un seguro de Bolso Protegido?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: '16 años', isCorrect: false, order: 0 },
      { text: '18 años', isCorrect: true, order: 1 },
      { text: '21 años', isCorrect: false, order: 2 },
      { text: '25 años', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estos objetos está cubierto dentro de una cobertura de Bolso Protegido?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Perfume', isCorrect: true, order: 0 },
      { text: 'Televisor', isCorrect: false, order: 1 },
      { text: 'Microondas', isCorrect: false, order: 2 },
      { text: 'Tablet del trabajo', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estos artículos deportivos está cubierto dentro de un seguro de Bolso?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Casco de ciclismo', isCorrect: false, order: 0 },
      { text: 'Raqueta de tenis', isCorrect: true, order: 1 },
      { text: 'Guantes de boxeo', isCorrect: false, order: 2 },
      { text: 'Palo de hockey', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál es la cobertura mínima en un seguro de auto obligatoria para circular?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Todo Riesgo', isCorrect: false, order: 0 },
      { text: 'Terceros Completo', isCorrect: false, order: 1 },
      { text: 'Responsabilidad Civil', isCorrect: true, order: 2 },
      { text: 'Robo Total', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál es la cobertura de seguro de Auto más completa?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Responsabilidad Civil', isCorrect: false, order: 0 },
      { text: 'Todo Total', isCorrect: false, order: 1 },
      { text: 'Terceros Completo', isCorrect: false, order: 2 },
      { text: 'Todo Riesgo', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿Qué cobertura protege contra robo parcial del vehículo?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Responsabilidad Civil', isCorrect: false, order: 0 },
      { text: 'Todo Total', isCorrect: false, order: 1 },
      { text: 'Terceros Completo', isCorrect: true, order: 2 },
      { text: 'Ninguna', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué cobertura incluye daños parciales por accidente?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Responsabilidad Civil', isCorrect: false, order: 0 },
      { text: 'Todo Total', isCorrect: false, order: 1 },
      { text: 'Terceros Completo', isCorrect: false, order: 2 },
      { text: 'Todo Riesgo', isCorrect: true, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estas coberturas de seguro de Auto incluye granizo ilimitado?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Responsabilidad Civil', isCorrect: false, order: 0 },
      { text: 'Todo Total', isCorrect: false, order: 1 },
      { text: 'Terceros Completo', isCorrect: false, order: 2 },
      { text: 'Todo Riesgo', isCorrect: true, order: 3 },
    ],
  },
  {
    question:
      '¿Qué elemento adicional puede asegurarse incluso contratando solo Responsabilidad Civil?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'GPS', isCorrect: false, order: 0 },
      { text: 'Polarizado', isCorrect: false, order: 1 },
      { text: 'Equipo de GNC', isCorrect: true, order: 2 },
      { text: 'Llantas deportivas', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué descuento ofrece Triunfo para vehículos nuevos?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Descuento por flota', isCorrect: false, order: 0 },
      { text: 'Descuento por 0 km', isCorrect: true, order: 1 },
      { text: 'Descuento por antigüedad', isCorrect: false, order: 2 },
      { text: 'Descuento por kilometraje', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué servicio brinda asistencia cuando el asegurado tiene un inconveniente legal relacionado con un siniestro?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Servicio mecánico', isCorrect: false, order: 0 },
      { text: 'Asistencia jurídica', isCorrect: true, order: 1 },
      { text: 'Cerrajería', isCorrect: false, order: 2 },
      { text: 'Gestoría', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué cobertura indemniza daños por incendio total, robo total y accidente total?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Responsabilidad Civil', isCorrect: false, order: 0 },
      { text: 'Todo Total', isCorrect: true, order: 1 },
      { text: 'Terceros Completo', isCorrect: false, order: 2 },
      { text: 'Todo Riesgo', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál es uno de los beneficios incluidos para quienes tienen débito automático?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Servicio de grúa extra', isCorrect: false, order: 0 },
      { text: 'Descuento en la póliza', isCorrect: true, order: 1 },
      { text: 'Cristales gratis', isCorrect: false, order: 2 },
      { text: 'Seguro de vida ampliado', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto protege tu vehículo?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Hogar', isCorrect: false, order: 0 },
      { text: 'Auto', isCorrect: true, order: 1 },
      { text: 'Vida', isCorrect: false, order: 2 },
      { text: 'Comercio', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué seguro protege una vivienda?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'AP', isCorrect: false, order: 0 },
      { text: 'Hogar', isCorrect: true, order: 1 },
      { text: 'Caución', isCorrect: false, order: 2 },
      { text: 'Agro', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto está pensado para motociclistas?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Auto', isCorrect: false, order: 0 },
      { text: 'Moto', isCorrect: true, order: 1 },
      { text: 'Bicicleta', isCorrect: false, order: 2 },
      { text: 'Comercio', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué seguro protege una bicicleta?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Bicicleta y Monopatín', isCorrect: true, order: 0 },
      { text: 'Hogar', isCorrect: false, order: 1 },
      { text: 'AP', isCorrect: false, order: 2 },
      { text: 'Vida', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué producto protege contra robos de carteras, mochilas y bolsos?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Robo de Celulares', isCorrect: false, order: 0 },
      { text: 'Bolso Protegido', isCorrect: true, order: 1 },
      { text: 'Hogar', isCorrect: false, order: 2 },
      { text: 'AP', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué seguro protege a una empresa o local comercial?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Comercio', isCorrect: true, order: 0 },
      { text: 'Vida', isCorrect: false, order: 1 },
      { text: 'Moto', isCorrect: false, order: 2 },
      { text: 'Agro', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto está dirigido al sector agropecuario?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Riesgos Agrícolas', isCorrect: true, order: 0 },
      { text: 'Hogar', isCorrect: false, order: 1 },
      { text: 'AP', isCorrect: false, order: 2 },
      { text: 'Auto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué seguro protege a una persona ante accidentes?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'AP (Accidentes Personales)', isCorrect: true, order: 0 },
      { text: 'Hogar', isCorrect: false, order: 1 },
      { text: 'Comercio', isCorrect: false, order: 2 },
      { text: 'Caución', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué seguro se relaciona con garantías contractuales?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Vida', isCorrect: false, order: 0 },
      { text: 'AP', isCorrect: false, order: 1 },
      { text: 'Caución', isCorrect: true, order: 2 },
      { text: 'Auto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto protege a los profesionales de la salud?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Praxis Médica', isCorrect: true, order: 0 },
      { text: 'Hogar', isCorrect: false, order: 1 },
      { text: 'Comercio', isCorrect: false, order: 2 },
      { text: 'Moto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estos NO es un producto de Triunfo?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Auto', isCorrect: false, order: 0 },
      { text: 'Hogar', isCorrect: false, order: 1 },
      { text: 'Mascotas Exóticas', isCorrect: true, order: 2 },
      { text: 'Moto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto es ideal para un ciclista urbano?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Bicicleta y Monopatín', isCorrect: true, order: 0 },
      { text: 'Auto', isCorrect: false, order: 1 },
      { text: 'Praxis Médica', isCorrect: false, order: 2 },
      { text: 'Agro', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto contrataría un médico?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Caución', isCorrect: false, order: 0 },
      { text: 'Praxis Médica', isCorrect: true, order: 1 },
      { text: 'Comercio', isCorrect: false, order: 2 },
      { text: 'Moto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué seguro contrataría el dueño de una librería?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Hogar', isCorrect: false, order: 0 },
      { text: 'Comercio', isCorrect: true, order: 1 },
      { text: 'AP', isCorrect: false, order: 2 },
      { text: 'Agro', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estos productos protege bienes y patrimonio familiar?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Hogar', isCorrect: true, order: 0 },
      { text: 'Caución', isCorrect: false, order: 1 },
      { text: 'Agro', isCorrect: false, order: 2 },
      { text: 'Praxis', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto protege ante accidentes fuera del ámbito laboral?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'AP (Accidentes Personales)', isCorrect: true, order: 0 },
      { text: 'Comercio', isCorrect: false, order: 1 },
      { text: 'Agro', isCorrect: false, order: 2 },
      { text: 'Hogar', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      'Si te roban la mochila con el celular dentro, ¿qué producto podría ayudarte?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Hogar', isCorrect: false, order: 0 },
      { text: 'Bolso Protegido', isCorrect: true, order: 1 },
      { text: 'Comercio', isCorrect: false, order: 2 },
      { text: 'Agro', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué producto ofrece cobertura para sembradíos afectados por fenómenos climáticos?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'AP', isCorrect: false, order: 0 },
      { text: 'Riesgos Agrícolas', isCorrect: true, order: 1 },
      { text: 'Caución', isCorrect: false, order: 2 },
      { text: 'Hogar', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué producto contrataría una empresa para garantizar el cumplimiento de un contrato?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'AP', isCorrect: false, order: 0 },
      { text: 'Caución', isCorrect: true, order: 1 },
      { text: 'Comercio', isCorrect: false, order: 2 },
      { text: 'Auto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué producto contrataría un repartidor que utiliza una moto?',
    category: TriviaCategory.PRODUCTOS,
    points: 15,
    options: [
      { text: 'Hogar', isCorrect: false, order: 0 },
      { text: 'Moto', isCorrect: true, order: 1 },
      { text: 'Agro', isCorrect: false, order: 2 },
      { text: 'Praxis', isCorrect: false, order: 3 },
    ],
  },
];
