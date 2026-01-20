"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { executeTest } from "@/lib/test-api";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export default function Mcmi4MysticPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const QUESTIONS_PER_PAGE = 10;

    // World display helpers
    const WORLD_NAMES: Record<string, string> = {
        atzilut: "Atzilut (Espiritual)",
        briah: "Briah (Mental)",
        yetzirah: "Yetzirah (Emocional)",
        assiah: "Assiah (Físico)",
    };
    const WORLD_COLORS: Record<string, string> = {
        atzilut: "bg-violet-600",
        briah: "bg-blue-600",
        yetzirah: "bg-green-600",
        assiah: "bg-amber-600",
    };

    // Fetch questions on mount
    useEffect(() => {
        const initTest = async () => {
            try {
                const response = await executeTest({
                    test_module_code: "mcmi4-mystic",
                    input_data: { generate_questions: true },
                    save_result: false
                });

                if (response.questions && Array.isArray(response.questions)) {
                    setQuestions(response.questions);
                } else {
                    throw new Error("No se recibieron preguntas del servidor");
                }
            } catch (err: any) {
                console.error("Error initializing MCMI-4:", err);
                setError(err.message || "Error al cargar el test");
            } finally {
                setLoading(false);
            }
        };

        initTest();
    }, []);

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
    const currentQuestions = questions.slice(
        currentPage * QUESTIONS_PER_PAGE,
        (currentPage + 1) * QUESTIONS_PER_PAGE
    );

    const handleAnswer = (questionId: string, value: boolean) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const canGoNext = currentQuestions.every(q => answers[q.question_id] !== undefined);
    const isLastPage = currentPage === totalPages - 1;
    const isComplete = questions.length > 0 && questions.every(q => answers[q.question_id] !== undefined);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        if (!isComplete || submitLoading) return;

        if (!confirm("¿Estás seguro de que deseas enviar tus respuestas?")) return;

        setSubmitLoading(true);
        setError(null);

        try {
            const payload = {
                test_module_code: "mcmi4-mystic",
                input_data: {
                    responses: answers,
                    questions_used: questions.map(q => q.question_id)
                },
                save_result: true
            };

            console.log("📤 Submitting MCMI-4 payload:", payload);

            const response = await executeTest(payload);

            console.log("📥 MCMI-4 response:", response);

            if (response.success === false) {
                throw new Error(response.result?.message || response.message || "El servidor no pudo procesar el test");
            }

            router.push("/dashboard/patient/results");
        } catch (err: any) {
            console.error("❌ Submission error:", err);
            setError(err.message || "Error al enviar respuestas");
            setSubmitLoading(false);
            window.scrollTo(0, 0);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
                <p className="text-gray-600">Cargando Matriz Cósmica Multiaxial...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-red-600 underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900">Matriz Cósmica Multiaxial (MCMI-4-Mystic)</h1>
                <p className="text-sm text-gray-600 mt-2">
                    Responde a las siguientes afirmaciones basándote en cómo te has sentido recientemente.
                    No hay respuestas correctas o incorrectas.
                </p>

                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-violet-600 transition-all duration-300"
                            style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
                        />
                    </div>
                    <span className="font-medium text-gray-900">
                        {Object.keys(answers).length} / {totalQuestions}
                    </span>
                </div>
                {/* World progress breakdown */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {(['atzilut', 'briah', 'yetzirah', 'assiah'] as const).map(world => {
                        const worldQs = questions.filter(q => q.world === world);
                        const answered = worldQs.filter(q => answers[q.question_id] !== undefined).length;
                        return (
                            <div key={world} className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${WORLD_COLORS[world]}`} />
                                <span className="text-gray-700">
                                    {WORLD_NAMES[world].split(' ')[0]}: {answered}/{worldQs.length}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {currentQuestions.map((q, index) => (
                    <div key={q.question_id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-full text-xs font-medium">
                                {currentPage * QUESTIONS_PER_PAGE + index + 1}
                            </span>
                            {/* World indicator */}
                            {q.world && (
                                <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] text-white rounded-full ${WORLD_COLORS[q.world] || 'bg-gray-600'}`}>
                                    {WORLD_NAMES[q.world] || q.world}
                                </span>
                            )}
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium mb-4">{q.text}</p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleAnswer(q.question_id, true)}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${answers[q.question_id] === true
                                            ? 'bg-violet-600 text-white shadow-sm'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Verdadero
                                    </button>
                                    <button
                                        onClick={() => handleAnswer(q.question_id, false)}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${answers[q.question_id] === false
                                            ? 'bg-slate-700 text-white shadow-sm'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Falso
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between sticky bottom-4">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Anterior
                </button>

                <span className="text-sm text-gray-500">
                    Página {currentPage + 1} de {totalPages}
                </span>

                {isLastPage ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!isComplete || submitLoading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Finalizar Test
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
