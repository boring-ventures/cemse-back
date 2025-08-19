const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'your-auth-token-here'; // Reemplazar con token válido

// Videos de YouTube proporcionados
const YOUTUBE_VIDEOS = {
  preview: 'https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1',
  lesson1: 'https://www.youtube.com/watch?v=uY5406XeobY',
  lesson2: 'https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1'
};

// Función para extraer el ID del video de YouTube
function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Función para crear un curso
async function createCourse() {
  try {
    console.log('📚 Creando curso con videos de YouTube...');
    
    const courseData = {
      title: "Curso de Música y Desarrollo Personal",
      slug: "curso-musica-desarrollo-personal",
      description: "Un curso completo que combina música y desarrollo personal para mejorar tu bienestar y habilidades.",
      shortDescription: "Aprende música y desarrollo personal en un solo curso",
      thumbnail: "https://img.youtube.com/vi/yEIKwtVRKuQ/maxresdefault.jpg",
      videoPreview: YOUTUBE_VIDEOS.preview,
      objectives: [
        "Aprender técnicas de música para relajación",
        "Desarrollar habilidades de autoconocimiento",
        "Mejorar el bienestar emocional",
        "Practicar mindfulness a través de la música"
      ],
      prerequisites: [
        "No se requiere experiencia previa",
        "Dispositivo para reproducir videos",
        "Ganas de aprender y mejorar"
      ],
      duration: 45, // duración total en minutos
      level: "BEGINNER",
      category: "SOFT_SKILLS",
      isMandatory: false,
      isActive: true,
      price: 0, // curso gratuito
      rating: 0,
      studentsCount: 0,
      completionRate: 0,
      totalLessons: 2,
      totalQuizzes: 0,
      totalResources: 0,
      tags: ["música", "desarrollo personal", "mindfulness", "bienestar"],
      certification: true,
      includedMaterials: [
        "Videos de YouTube",
        "Material de apoyo",
        "Certificado de finalización"
      ],
      instructorId: null, // se puede asignar después
      institutionName: "Plataforma de Aprendizaje"
    };
    
    const response = await axios.post(`${API_BASE_URL}/course`, courseData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Curso creado exitosamente:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando curso:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un módulo
async function createModule(courseId, title, description, orderIndex) {
  try {
    console.log(`📖 Creando módulo: ${title}...`);
    
    const moduleData = {
      courseId: courseId,
      title: title,
      description: description,
      orderIndex: orderIndex,
      estimatedDuration: 20, // duración estimada en minutos
      isLocked: false,
      prerequisites: []
    };
    
    const response = await axios.post(`${API_BASE_URL}/coursemodule`, moduleData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Módulo creado exitosamente:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando módulo:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear una lección con video de YouTube
async function createYouTubeLesson(moduleId, title, description, youtubeUrl, orderIndex) {
  try {
    console.log(`🎬 Creando lección: ${title}...`);
    
    const lessonData = {
      title: title,
      description: description,
      content: `En esta lección aprenderás a través del video de YouTube. Asegúrate de ver el video completo para obtener el máximo beneficio.`,
      moduleId: moduleId,
      contentType: "VIDEO",
      videoUrl: youtubeUrl,
      duration: 15, // duración estimada en minutos
      orderIndex: orderIndex,
      isRequired: true,
      isPreview: false
    };
    
    const response = await axios.post(`${API_BASE_URL}/lessons`, lessonData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Lección creada exitosamente:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando lección:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener información del video de YouTube
async function getYouTubeVideoInfo(youtubeUrl) {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) {
    throw new Error('URL de YouTube inválida');
  }
  
  return {
    videoId: videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    watchUrl: youtubeUrl
  };
}

// Función para obtener un curso con todas sus lecciones
async function getCourseWithLessons(courseId) {
  try {
    console.log('📋 Obteniendo curso con lecciones...');
    
    const response = await axios.get(`${API_BASE_URL}/course/${courseId}/full`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Curso obtenido exitosamente');
    return response.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo curso:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🎵 Iniciando creación de curso con videos de YouTube...\n');
    
    // 1. Crear el curso
    const course = await createCourse();
    
    // 2. Crear el módulo
    const module = await createModule(
      course.id,
      "Fundamentos de Música y Desarrollo Personal",
      "En este módulo aprenderás los fundamentos básicos de la música y cómo aplicarla para tu desarrollo personal.",
      1
    );
    
    // 3. Crear las lecciones con videos de YouTube
    const lesson1 = await createYouTubeLesson(
      module.id,
      "Introducción a la Música para el Desarrollo Personal",
      "Aprende cómo la música puede transformar tu vida y mejorar tu bienestar emocional.",
      YOUTUBE_VIDEOS.lesson1,
      1
    );
    
    const lesson2 = await createYouTubeLesson(
      module.id,
      "Técnicas Avanzadas de Música y Mindfulness",
      "Explora técnicas avanzadas para usar la música como herramienta de mindfulness y meditación.",
      YOUTUBE_VIDEOS.lesson2,
      2
    );
    
    // 4. Obtener información de los videos
    const videoInfo = {
      preview: await getYouTubeVideoInfo(YOUTUBE_VIDEOS.preview),
      lesson1: await getYouTubeVideoInfo(YOUTUBE_VIDEOS.lesson1),
      lesson2: await getYouTubeVideoInfo(YOUTUBE_VIDEOS.lesson2)
    };
    
    // 5. Obtener el curso completo
    const fullCourse = await getCourseWithLessons(course.id);
    
    console.log('\n🎉 Curso creado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`- Curso ID: ${course.id}`);
    console.log(`- Módulo ID: ${module.id}`);
    console.log(`- Lección 1 ID: ${lesson1.id}`);
    console.log(`- Lección 2 ID: ${lesson2.id}`);
    console.log('\n📹 Información de Videos:');
    console.log('Preview:', videoInfo.preview);
    console.log('Lección 1:', videoInfo.lesson1);
    console.log('Lección 2:', videoInfo.lesson2);
    
    // 6. Mostrar URLs para el frontend
    console.log('\n🔗 URLs para el Frontend:');
    console.log(`- Obtener curso completo: GET ${API_BASE_URL}/course/${course.id}/full`);
    console.log(`- Obtener solo preview: GET ${API_BASE_URL}/course/${course.id}`);
    console.log(`- Obtener lecciones del módulo: GET ${API_BASE_URL}/lessons/module/${module.id}`);
    
    return {
      course: fullCourse,
      videoInfo: videoInfo
    };
    
  } catch (error) {
    console.error('\n💥 Error en la creación del curso:', error.message);
    throw error;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  createCourse,
  createModule,
  createYouTubeLesson,
  getYouTubeVideoInfo,
  getCourseWithLessons,
  YOUTUBE_VIDEOS
};
