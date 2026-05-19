import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import AddressManager from "@/components/profile/AddressManager";

export default async function AddressesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      label: true,
      recipientName: true,
      phone: true,
      province: true,
      city: true,
      district: true,
      postalCode: true,
      street: true,
      isDefault: true,
    },
  });

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-2xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-brand-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Profil
        </Link>

        <AddressManager initialAddresses={addresses} />
      </div>
    </div>
  );
}
