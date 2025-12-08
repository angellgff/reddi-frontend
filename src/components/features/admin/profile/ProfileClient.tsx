"use client";

import { useState, useTransition } from "react";
import { AdminProfileFull } from "@/src/lib/admin/profile/data/getProfile";
import { updateAdminProfile, updateNotifications, signOutAction, changePassword } from "@/src/lib/actions/admin/profile";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

interface ProfileClientProps {
  initialData: AdminProfileFull;
}

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [passwordOpen, setPasswordOpen] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState(initialData.first_name || "");
  const [lastName, setLastName] = useState(initialData.last_name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [phone, setPhone] = useState(initialData.phone_number || "");
  
  const [notifications, setNotifications] = useState(initialData.notification_preferences);
  const [fullNameInput, setFullNameInput] = useState(`${initialData.first_name || ""} ${initialData.last_name || ""}`.trim());

  const handleSave = async () => {
    startTransition(async () => {
      try {
        // 1. Update Profile (Name, Email, Phone)
        const formData = new FormData();
        formData.append("fullName", fullNameInput);
        formData.append("email", email);
        formData.append("phone", phone);

        const res = await updateAdminProfile(null, formData);
        if (res?.error) {
          alert(res.error); // Use alert fallback
          return;
        }

        // 2. Update Notifications
        await updateNotifications(initialData.id, notifications);

        alert("Perfil actualizado correctamente");
        router.refresh();
      } catch (e: any) {
        alert("Error al guardar: " + e.message);
      }
    });
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    if (newPass !== confirmPass) {
      alert("Las contraseñas no coinciden");
      return;
    }
    
    startTransition(async () => {
      const res = await changePassword(null, formData);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Contraseña actualizada");
        setPasswordOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1217px] mx-auto p-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold font-poppins text-[#171717]">Mi Perfil</h1>
        <p className="text-sm text-[#292929] font-medium font-roboto">Gestiona tu información personal y configuración</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Personal Data */}
        <div className="flex-1 bg-white rounded-2xl border border-[#D9DCE3] p-5 lg:p-8 flex flex-col gap-6 h-fit">
          <h2 className="text-xl font-semibold text-[#04BD88] font-poppins">Datos Personales</h2>
          
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-[#292929]">Nombre Completo</Label>
            <Input 
              value={fullNameInput} 
              onChange={(e) => setFullNameInput(e.target.value)} 
              placeholder="Ingresar la información" 
              className="rounded-xl border-[#D9DCE3] h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-[#292929]">Correo electrónico</Label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Ingresar la información" 
              className="rounded-xl border-[#D9DCE3] h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-[#292929]">Teléfono</Label>
            <Input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Ingresar la información" 
              className="rounded-xl border-[#D9DCE3] h-10"
            />
          </div>
        </div>

        {/* Right Column: Security & Notifications */}
        <div className="w-full lg:w-[546px] bg-white rounded-2xl border border-[#D9DCE3] p-5 lg:p-8 flex flex-col gap-8 h-fit">
          
          {/* Security */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-[#04BD88] font-poppins">Seguridad de la Cuenta</h2>
            <div className="flex flex-row gap-5">
              
              <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 h-11 border-[#202124] text-[#202124] rounded-xl hover:bg-gray-50">
                    Cambiar contraseña
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambiar contraseña</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 mt-4">
                     <Input name="newPassword" type="password" placeholder="Nueva contraseña" required />
                     <Input name="confirmPassword" type="password" placeholder="Confirmar contraseña" required />
                     <Button type="submit" disabled={isPending} className="bg-[#04BD88] hover:bg-[#03a072] text-white">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Actualizar"}
                     </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={() => signOutAction()} 
                className="flex-1 h-11 bg-[#04BD88] hover:bg-[#03966d] text-white rounded-xl"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>

          <div className="h-[1px] bg-[#E5E7EB] w-full" />

          {/* Notifications */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-[#04BD88] font-poppins">Preferencias de Notificaciones</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#171717] font-poppins">Notificaciones por correo</p>
                  <p className="text-xs text-[#737373] font-roboto">Recibir alertas de pedidos y pagos</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(c: boolean) => setNotifications(prev => ({...prev, email: c}))} 
                />
              </div>

               <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#171717] font-poppins">Notificaciones push</p>
                  <p className="text-xs text-[#737373] font-roboto">Alertas en tiempo real en la app</p>
                </div>
                <Switch 
                  checked={notifications.push} 
                  onCheckedChange={(c: boolean) => setNotifications(prev => ({...prev, push: c}))} 
                />
              </div>

               <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#171717] font-poppins">Notificaciones SMS</p>
                  <p className="text-xs text-[#737373] font-roboto">Mensajes de texto importantes</p>
                </div>
                <Switch 
                  checked={notifications.sms} 
                  onCheckedChange={(c: boolean) => setNotifications(prev => ({...prev, sms: c}))} 
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-row justify-between items-center mt-4">
        <Button variant="ghost" className="text-[#202124] flex gap-2 pl-0 hover:bg-transparent hover:underline" onClick={() => router.back()}>
          <ArrowLeft size={20} />
          Volver
        </Button>
        <div className="flex gap-4">
          <Button variant="outline" className="border-[#202124] text-[#202124] rounded-xl px-6" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button 
            disabled={isPending} 
            onClick={handleSave} 
            className="bg-[#04BD88] hover:bg-[#03966d] text-white rounded-xl px-6 flex gap-2"
          >
            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Cambios"}
             {!isPending && <ArrowRight size={18} />}
          </Button>
        </div>
      </div>

    </div>
  );
}
