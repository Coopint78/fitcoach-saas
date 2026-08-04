import { Suspense } from "react";
import RegistroForm from "./registro-form";

export const dynamic = 'force-dynamic';

export default function RegistroPage() {
  return (
    <Suspense fallback={<RegistroFormSkeleton />}>
      <RegistroForm />
    </Suspense>
  );
}

function RegistroFormSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center p-4">
      <div className="w-96 space-y-4">
        <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
