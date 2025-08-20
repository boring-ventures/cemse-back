"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourseEnrollments = listCourseEnrollments;
exports.getCourseEnrollment = getCourseEnrollment;
exports.createCourseEnrollment = createCourseEnrollment;
exports.updateCourseEnrollment = updateCourseEnrollment;
exports.deleteCourseEnrollment = deleteCourseEnrollment;
const prisma_1 = require("../lib/prisma");
async function listCourseEnrollments(req, res) {
    try {
        const user = req.user;
        let whereClause = {};
        if (user && user.type === 'user' && user.role !== 'SUPERADMIN') {
            whereClause.studentId = user.id;
        }
        const items = await prisma_1.prisma.courseEnrollment.findMany({
            where: whereClause,
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            },
                            orderBy: { orderIndex: 'asc' }
                        },
                        quizzes: {
                            include: {
                                questions: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            }
                        },
                        instructor: true
                    }
                },
                student: true
            },
            orderBy: {
                enrolledAt: 'desc'
            }
        });
        console.log('🔍 Iniciando enriquecimiento de datos...');
        const enrichedItems = await Promise.all(items.map(async (enrollment) => {
            console.log(`📚 Procesando curso: ${enrollment.course.title}`);
            const enrichedCourse = {
                ...enrollment.course,
                modules: await Promise.all(enrollment.course.modules.map(async (module) => {
                    console.log(`📦 Procesando módulo: ${module.title}`);
                    const enrichedLessons = await Promise.all(module.lessons.map(async (lesson) => {
                        console.log(`📖 Procesando lección: ${lesson.title} (ID: ${lesson.id})`);
                        try {
                            const resources = await prisma_1.prisma.$queryRaw `
                      SELECT id, lesson_id as lessonId, title, description, type, url, file_path as filePath, 
                             file_size as fileSize, order_index as orderIndex, is_downloadable as isDownloadable, 
                             created_at as createdAt
                      FROM lesson_resources 
                      WHERE lesson_id = ${lesson.id} 
                      ORDER BY order_index ASC
                    `;
                            console.log(`   📎 Recursos encontrados: ${resources.length}`);
                            const lessonQuizzes = await prisma_1.prisma.quiz.findMany({
                                where: { lessonId: lesson.id },
                                include: {
                                    questions: {
                                        orderBy: { orderIndex: 'asc' }
                                    }
                                }
                            });
                            console.log(`   📝 Quizzes encontrados: ${lessonQuizzes.length}`);
                            const enrichedLesson = {
                                ...lesson,
                                resources,
                                quizzes: lessonQuizzes
                            };
                            console.log(`   ✅ Lección enriquecida: ${enrichedLesson.title}`);
                            console.log(`      - Recursos: ${enrichedLesson.resources.length}`);
                            console.log(`      - Quizzes: ${enrichedLesson.quizzes.length}`);
                            return enrichedLesson;
                        }
                        catch (error) {
                            console.error(`❌ Error procesando lección ${lesson.id}:`, error);
                            return {
                                ...lesson,
                                resources: [],
                                quizzes: []
                            };
                        }
                    }));
                    return {
                        ...module,
                        lessons: enrichedLessons
                    };
                }))
            };
            return {
                ...enrollment,
                course: enrichedCourse
            };
        }));
        console.log('✅ Enriquecimiento completado');
        console.log(`📊 Total de inscripciones enriquecidas: ${enrichedItems.length}`);
        console.log('🔍 VERIFICACIÓN FINAL - Enriquecimiento completado');
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        return res.json(enrichedItems);
    }
    catch (error) {
        console.error("Error listing course enrollments:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getCourseEnrollment(req, res) {
    try {
        const user = req.user;
        const enrollmentId = req.params['id'] || '';
        const item = await prisma_1.prisma.courseEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            },
                            orderBy: { orderIndex: 'asc' }
                        },
                        quizzes: {
                            include: {
                                questions: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            }
                        },
                        instructor: true
                    }
                },
                student: true
            }
        });
        if (!item) {
            return res.status(404).json({ message: "Course enrollment not found" });
        }
        if (user && user.type === 'user' && item.studentId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        console.log('🔍 Iniciando enriquecimiento de inscripción específica...');
        const enrichedCourse = {
            ...item.course,
            modules: await Promise.all(item.course.modules.map(async (module) => {
                console.log(`📦 Procesando módulo: ${module.title}`);
                const enrichedLessons = await Promise.all(module.lessons.map(async (lesson) => {
                    console.log(`📖 Procesando lección: ${lesson.title} (ID: ${lesson.id})`);
                    try {
                        const resources = await prisma_1.prisma.$queryRaw `
                  SELECT id, lesson_id as lessonId, title, description, type, url, file_path as filePath, 
                         file_size as fileSize, order_index as orderIndex, is_downloadable as isDownloadable, 
                         created_at as createdAt
                  FROM lesson_resources 
                  WHERE lesson_id = ${lesson.id} 
                  ORDER BY order_index ASC
                `;
                        console.log(`   📎 Recursos encontrados: ${resources.length}`);
                        const lessonQuizzes = await prisma_1.prisma.quiz.findMany({
                            where: { lessonId: lesson.id },
                            include: {
                                questions: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            }
                        });
                        console.log(`   📝 Quizzes encontrados: ${lessonQuizzes.length}`);
                        const enrichedLesson = {
                            ...lesson,
                            resources,
                            quizzes: lessonQuizzes
                        };
                        console.log(`   ✅ Lección enriquecida: ${enrichedLesson.title}`);
                        console.log(`      - Recursos: ${enrichedLesson.resources.length}`);
                        console.log(`      - Quizzes: ${enrichedLesson.quizzes.length}`);
                        return enrichedLesson;
                    }
                    catch (error) {
                        console.error(`❌ Error procesando lección ${lesson.id}:`, error);
                        return {
                            ...lesson,
                            resources: [],
                            quizzes: []
                        };
                    }
                }));
                return {
                    ...module,
                    lessons: enrichedLessons
                };
            }))
        };
        const enrichedItem = {
            ...item,
            course: enrichedCourse
        };
        console.log('✅ Enriquecimiento de inscripción específica completado');
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        return res.json(enrichedItem);
    }
    catch (error) {
        console.error("Error getting course enrollment:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createCourseEnrollment(req, res) {
    try {
        const { courseId } = req.body;
        const studentId = req.user?.id;
        if (!studentId || !courseId) {
            return res.status(400).json({
                message: "courseId is required and user must be authenticated"
            });
        }
        const newItem = await prisma_1.prisma.courseEnrollment.create({
            data: {
                studentId,
                courseId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                student: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error('Error creating course enrollment:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                message: "Student is already enrolled in this course"
            });
        }
        return res.status(500).json({
            message: "Error creating course enrollment",
            error: error.message
        });
    }
}
async function updateCourseEnrollment(req, res) {
    const updated = await prisma_1.prisma.courseEnrollment.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteCourseEnrollment(req, res) {
    await prisma_1.prisma.courseEnrollment.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=CourseEnrollmentController.js.map