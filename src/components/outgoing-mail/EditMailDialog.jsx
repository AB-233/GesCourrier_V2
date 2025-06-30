import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EditMailDialog = ({ isOpen, setIsOpen, editingMail, setEditingMail, handleUpdateMail, destinations }) => {
  if (!editingMail) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le courrier de départ</DialogTitle>
          <DialogDescription className="text-slate-400">
            Modifiez les informations du courrier de départ.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editSignatureDate" className="text-slate-200">Date de signature *</Label>
              <Input
                id="editSignatureDate"
                type="date"
                value={editingMail.signatureDate}
                onChange={(e) => setEditingMail({ ...editingMail, signatureDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSignatureNumber" className="text-slate-200">Numéro de signature *</Label>
              <Input
                id="editSignatureNumber"
                placeholder="Ex: SIG-2024-001"
                value={editingMail.signatureNumber}
                onChange={(e) => setEditingMail({ ...editingMail, signatureNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Structure réceptrice *</Label>
            <Select value={editingMail.destination} onValueChange={(value) => setEditingMail({ ...editingMail, destination: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Sélectionnez la destination" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {destinations.map((destination) => (
                  <SelectItem key={destination} value={destination} className="text-white hover:bg-slate-700">
                    {destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editSubject" className="text-slate-200">Objet du courrier *</Label>
            <Textarea
              id="editSubject"
              placeholder="Décrivez l'objet du courrier..."
              value={editingMail.subject}
              onChange={(e) => setEditingMail({ ...editingMail, subject: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Pièce jointe</Label>
              <Input
                type="file"
                accept="*"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => {
                      setEditingMail(prev => ({
                        ...prev,
                        attachment: ev.target.result, // base64 string
                        attachmentName: file.name
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="bg-slate-700 border-slate-600 text-white"
              />
              {editingMail.attachmentName && (
                <span className="text-xs text-slate-300">{editingMail.attachmentName}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editReceptionist" className="text-slate-200">Nom du réceptionniste</Label>
              <Input
                id="editReceptionist"
                placeholder="Nom du réceptionniste"
                value={editingMail.receptionist}
                onChange={(e) => setEditingMail({ ...editingMail, receptionist: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editTransmissionDate" className="text-slate-200">Date de transmission</Label>
              <Input
                id="editTransmissionDate"
                type="date"
                value={editingMail.transmissionDate}
                onChange={(e) => setEditingMail({ ...editingMail, transmissionDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTransmissionTime" className="text-slate-200">Heure de transmission</Label>
              <Input
                id="editTransmissionTime"
                type="time"
                value={editingMail.transmissionTime}
                onChange={(e) => setEditingMail({ ...editingMail, transmissionTime: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTransmissionNumber" className="text-slate-200">Numéro de transmission</Label>
              <Input
                id="editTransmissionNumber"
                placeholder="Ex: TRANS-2024-001"
                value={editingMail.transmissionNumber}
                onChange={(e) => setEditingMail({ ...editingMail, transmissionNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editObservations" className="text-slate-200">Observations</Label>
            <Textarea
              id="editObservations"
              placeholder="Observations particulières..."
              value={editingMail.observations}
              onChange={(e) => setEditingMail({ ...editingMail, observations: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdateMail}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMailDialog;