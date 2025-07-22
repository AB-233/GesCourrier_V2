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

const AddMailDialog = ({
  isOpen,
  setIsOpen,
  newMail,
  setNewMail,
  handleAddMail,
  mailTypes,
  sources,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer un nouveau courrier</DialogTitle>
          <DialogDescription className="text-slate-400">
            Saisissez les informations du courrier d'arrivée.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalDate" className="text-slate-200">Date d'arrivée *</Label>
              <Input
                id="arrivalDate"
                type="date"
                value={newMail.arrivalDate}
                onChange={(e) => setNewMail({ ...newMail, arrivalDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalTime" className="text-slate-200">Heure d'arrivée</Label>
              <Input
                id="arrivalTime"
                type="time"
                value={newMail.arrivalTime}
                onChange={(e) => setNewMail({ ...newMail, arrivalTime: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalNumber" className="text-slate-200">Numéro d'arrivée *</Label>
              <Input
                id="arrivalNumber"
                placeholder="Ex: ARR-2024-001"
                value={newMail.arrivalNumber}
                onChange={(e) => setNewMail({ ...newMail, arrivalNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureDate" className="text-slate-200">Date de signature</Label>
              <Input
                id="signatureDate"
                type="date"
                value={newMail.signatureDate}
                onChange={(e) => setNewMail({ ...newMail, signatureDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signatureNumber" className="text-slate-200">Numéro de signature</Label>
              <Input
                id="signatureNumber"
                placeholder="Ex: SIG-2024-001"
                value={newMail.signatureNumber}
                onChange={(e) => setNewMail({ ...newMail, signatureNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Structure émettrice *</Label>
              <Select value={newMail.source} onValueChange={(value) => setNewMail({ ...newMail, source: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Sélectionnez la source" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {sources.map((source) => (
                    <SelectItem key={source} value={source} className="text-white hover:bg-slate-700">
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Type de courrier *</Label>
            <Select value={newMail.type} onValueChange={(value) => setNewMail({ ...newMail, type: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {mailTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-slate-200">Objet du courrier *</Label>
            <Textarea
              id="subject"
              placeholder="Décrivez l'objet du courrier..."
              value={newMail.subject}
              onChange={(e) => setNewMail({ ...newMail, subject: e.target.value })}
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
                      setNewMail(prev => ({
                        ...prev,
                        attachment: ev.target.result, // base64 string
                        attachmentName: file.name
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {newMail.attachmentName && (
                <span className="text-xs text-slate-300">{newMail.attachmentName}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="receptionist" className="text-slate-200">Nom du réceptionniste</Label>
              <Input
                id="receptionist"
                placeholder="Nom du réceptionniste"
                value={newMail.receptionist}
                onChange={(e) => setNewMail({ ...newMail, receptionist: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observations" className="text-slate-200">Observations</Label>
            <Textarea
              id="observations"
              placeholder="Observations particulières..."
              value={newMail.observations}
              onChange={(e) => setNewMail({ ...newMail, observations: e.target.value })}
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
            onClick={handleAddMail}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMailDialog;