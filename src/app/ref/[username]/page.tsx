import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ReferralPage({ params }: { params: { username: string } }) {
  const supabase = await createClient();

  // Find trainer by username
  const { data: trainer, error } = await supabase
    .from("trainers")
    .select("id, name, email, bio, photo_url, specialty, location, instagram")
    .eq("username", params.username.toLowerCase())
    .single();

  if (error || !trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Entrenador no encontrado</h1>
          <p className="text-gray-600">El perfil que buscas no existe.</p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const firstName = trainer.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Trainer Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with photo */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-32"></div>

          <div className="px-6 pb-6">
            {/* Photo */}
            {trainer.photo_url && (
              <div className="flex justify-center -mt-16 mb-4">
                <img
                  src={trainer.photo_url}
                  alt={trainer.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
            )}

            {/* Name and details */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {trainer.name}
            </h1>

            {trainer.specialty && (
              <p className="text-center text-indigo-600 font-medium mb-4">
                {trainer.specialty}
              </p>
            )}

            {trainer.location && (
              <p className="text-center text-gray-600 text-sm mb-6">
                📍 {trainer.location}
              </p>
            )}

            {trainer.bio && (
              <p className="text-center text-gray-700 mb-6 leading-relaxed">
                {trainer.bio}
              </p>
            )}

            {trainer.instagram && (
              <div className="text-center mb-6">
                <a
                  href={`https://instagram.com/${trainer.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Instagram: {trainer.instagram}
                </a>
              </div>
            )}

            {/* CTA */}
            <div className="space-y-3">
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {firstName} te invita a comenzar tu transformación con FitCoach
                </p>
                <p className="text-lg font-bold text-indigo-600">
                  🎉 14 días de prueba gratis
                </p>
              </div>

              <Link href="/registro" className="block">
                <Button className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700">
                  Comenzar prueba gratis
                </Button>
              </Link>

              <p className="text-center text-xs text-gray-500">
                No requiere tarjeta de crédito. Puedes cancelar en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm text-gray-600">Acceso inmediato</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm text-gray-600">App + Web</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-sm text-gray-600">Rutinas personalizadas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
