"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function VerificarEmailContent() {
  const params = useSearchParams();
  const error = params.get("error");

  if (error === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Enlace inválido o expirado</h1>
          <p className="text-gray-500 text-sm mb-6">
            El enlace de confirmación no es válido o ya fue utilizado. Intentá registrarte nuevamente.
          </p>
          <Link
            href="/registro"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Ir al registro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Revisá tu email</h1>
        <p className="text-gray-500 text-sm mb-2">
          Te enviamos un enlace de confirmación. Hacé clic en él para activar tu cuenta y comenzar tu prueba gratuita de 14 días.
        </p>
        <p className="text-gray-400 text-xs mt-4">
          ¿No llegó el email? Revisá la carpeta de spam.
        </p>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Link href="/login" className="text-indigo-600 text-sm hover:underline">
            Ya confirmé mi cuenta → Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <VerificarEmailContent />
    </Suspense>
  );
}
