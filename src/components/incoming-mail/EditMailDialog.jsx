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

const EditMailDialog = ({ isOpen, setIsOpen, editingMail, setEditingMail, handleUpdateMail, mailTypes, sources }) => {
  if (!editingMail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le courrier</DialogTitle>
          <DialogDescription className="text-slate-400">
            Modifiez les informations du courrier d'arrivée.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editArrivalDate" className="text-slate-200">Date d'arrivée *</Label>
              <Input
                id="editArrivalDate"
                type="date"
                value={editingMail.arrivalDate}
                onChange={(e) => setEditingMail({ ...editingMail, arrivalDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editArrivalTime" className="text-slate-200">Heure d'arrivée</Label>
              <Input
                id="editArrivalTime"
                type="time"
                value={editingMail.arrivalTime}
                onChange={(e) => setEditingMail({ ...editingMail, arrivalTime: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editArrivalNumber" className="text-slate-200">Numéro d'arrivée *</Label>
              <Input
                id="editArrivalNumber"
                placeholder="Ex: ARR-2024-001"
                value={editingMail.arrivalNumber}
                onChange={(e) => setEditingMail({ ...editingMail, arrivalNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSignatureDate" className="text-slate-200">Date de signature</Label>
              <Input
                id="editSignatureDate"
                type="date"
                value={editingMail.signatureDate}
                onChange={(e) => setEditingMail({ ...editingMail, signatureDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editSignatureNumber" className="text-slate-200">Numéro de signature</Label>
              <Input
                id="editSignatureNumber"
                placeholder="Ex: SIG-2024-001"
                value={editingMail.signatureNumber}
                onChange={(e) => setEditingMail({ ...editingMail, signatureNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Structure émettrice *</Label>
              <Select value={editingMail.source} onValueChange={(value) => setEditingMail({ ...editingMail, source: value })}>
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
            <Select value={editingMail.type} onValueChange={(value) => setEditingMail({ ...editingMail, type: value })}>
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
              <Label htmlFor="editAttachment" className="text-slate-200">Pièce jointe</Label>
              <Input
                id="editAttachment"
                placeholder="Nom du fichier joint"
                value={editingMail.attachment}
                onChange={(e) => setEditingMail({ ...editingMail, attachment: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMailDialog;