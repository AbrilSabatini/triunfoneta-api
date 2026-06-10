import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const ESUELDOS = [
  {
    question:
      '¿Dónde se encuentra el menú principal con todas las funcionalidades del sistema?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      {
        text: 'En la parte inferior de la pantalla',
        isCorrect: false,
        order: 0,
      },
      { text: 'En el menú lateral izquierdo', isCorrect: true, order: 1 },
      { text: 'En el perfil del usuario', isCorrect: false, order: 2 },
      { text: 'En la cartelera de información', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué dato podés visualizar dentro de tu perfil?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Clave bancaria de la empresa', isCorrect: false, order: 0 },
      { text: 'Número de legajo', isCorrect: true, order: 1 },
      {
        text: 'Historial salarial de todos los empleados',
        isCorrect: false,
        order: 2,
      },
      { text: 'Organigrama completo', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Para qué sirve configurar la firma electrónica?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Para registrar asistencia', isCorrect: false, order: 0 },
      { text: 'Para solicitar vacaciones', isCorrect: false, order: 1 },
      {
        text: 'Para firmar recibos de sueldo y documentos',
        isCorrect: true,
        order: 2,
      },
      { text: 'Para cambiar la contraseña', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estos métodos NO se utiliza para registrar el horario laboral?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'PIN de marcación', isCorrect: false, order: 0 },
      { text: 'Código QR', isCorrect: false, order: 1 },
      { text: 'Reconocimiento facial', isCorrect: false, order: 2 },
      { text: 'Huella digital', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿Qué solicitud permite pedir días de descanso anual?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Adelanto de sueldo', isCorrect: false, order: 0 },
      { text: 'Cambio de banco', isCorrect: false, order: 1 },
      { text: 'Vacaciones', isCorrect: true, order: 2 },
      { text: 'Certificado laboral', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué estado tiene una solicitud recién creada?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Ejecutada', isCorrect: false, order: 0 },
      { text: 'Finalizada', isCorrect: false, order: 1 },
      { text: 'En proceso', isCorrect: false, order: 2 },
      { text: 'Ingresada', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿Qué significa que una solicitud esté "En proceso"?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Fue rechazada', isCorrect: false, order: 0 },
      {
        text: 'Está aprobada por el supervisor y pasó a RRHH',
        isCorrect: true,
        order: 1,
      },
      { text: 'Ya fue finalizada', isCorrect: false, order: 2 },
      { text: 'Está anulada', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué sucede cuando una solicitud queda "Finalizada"?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Puede modificarse libremente', isCorrect: false, order: 0 },
      {
        text: 'Puede agregarse documentación nueva',
        isCorrect: false,
        order: 1,
      },
      {
        text: 'Ya no se pueden realizar cambios ni adjuntar archivos',
        isCorrect: true,
        order: 2,
      },
      { text: 'Vuelve a aprobación', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Dónde pueden visualizarse las notificaciones del portal?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Parte superior izquierda', isCorrect: true, order: 0 },
      { text: 'Parte inferior derecha', isCorrect: false, order: 1 },
      { text: 'Perfil del usuario', isCorrect: false, order: 2 },
      { text: 'Cartelera principal', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuántos días se computan si un certificado médico indica "72 horas de reposo a partir del 06/06/2025"?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: '2 días', isCorrect: false, order: 0 },
      { text: '3 días', isCorrect: true, order: 1 },
      { text: '4 días', isCorrect: false, order: 2 },
      { text: '5 días', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cómo deben solicitarse las vacaciones en el sistema?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'En cualquier cantidad de días', isCorrect: false, order: 0 },
      { text: 'Siempre de lunes a viernes', isCorrect: false, order: 1 },
      {
        text: 'En múltiplos de 7 días y comenzando un lunes',
        isCorrect: true,
        order: 2,
      },
      { text: 'Solo por quincena', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál es la acción más importante para poder firmar recibos y documentos dentro del portal?',
    category: TriviaCategory.ESUELDOS,
    points: 35,
    options: [
      { text: 'Actualizar el correo electrónico', isCorrect: false, order: 0 },
      { text: 'Cargar una foto de perfil', isCorrect: false, order: 1 },
      {
        text: 'Configurar la contraseña de los certificados digitales',
        isCorrect: true,
        order: 2,
      },
      { text: 'Descargar el código QR', isCorrect: false, order: 3 },
    ],
  },
];
