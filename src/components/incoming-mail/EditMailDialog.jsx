import React, { useState } from 'react';
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
import { toast } from '@/components/ui/use-toast';

const EditMailDialog = ({ isOpen, setIsOpen, editingMail, setEditingMail, handleUpdateMail, mailTypes, sources }) => {
  const [arrivalNumberError, setArrivalNumberError] = useState('');
  const [signatureDateError, setSignatureDateError] = useState('');
  const [checkingUnique, setCheckingUnique] = useState(false);

  // Validation en temps réel du numéro d'arrivée
  const validateArrivalNumber = (value) => {
    if (!value) {
      setArrivalNumberError('');
      return;
    }
    
    if (isNaN(Number(value)) || !Number.isInteger(Number(value)) || Number(value) <= 0) {
      setArrivalNumberError('Le numéro d\'arrivée doit être un entier positif.');
      return;
    }
    
    setArrivalNumberError('');
  };

  // Validation de la date de signature
  const validateSignatureDate = (signatureDate, arrivalDate) => {
    if (!signatureDate || !arrivalDate) {
      setSignatureDateError('');
      return;
    }
    
    const signature = new Date(signatureDate);
    const arrival = new Date(arrivalDate);
    
    if (signature > arrival) {
      setSignatureDateError('La date de signature ne peut pas être postérieure à la date d\'arrivée.');
      return false;
    }
    
    setSignatureDateError('');
    return true;
  };

  // Fonction pour vérifier l'unicité du numéro d'arrivée pour l'année
  const checkArrivalNumberUnique = async (number, year, currentId) => {
    setCheckingUnique(true);
    setArrivalNumberError('');
    try {
      const response = await fetch(`http://localhost:4000/api/incoming-mails/check-unique?year=${year}&number=${number}&excludeId=${currentId}`);
      const data = await response.json();
      if (!data.unique) {
        setArrivalNumberError('Ce numéro d\'arrivée existe déjà pour cette année.');
        return false;
      }
      return true;
    } catch (err) {
      setArrivalNumberError("Erreur lors de la vérification d'unicité.");
      return false;
    } finally {
      setCheckingUnique(false);
    }
  };

  // Handler personnalisé pour la mise à jour
  const handleUpdateMailWithCheck = async () => {
    const year = editingMail.arrivalDate ? new Date(editingMail.arrivalDate).getFullYear() : '';
    const number = editingMail.arrivalNumber;
    if (!number || !year) {
      setArrivalNumberError('Veuillez saisir un numéro et une date valides.');
      return;
    }
    if (!editingMail.arrivalNumber || isNaN(Number(editingMail.arrivalNumber)) || !Number.isInteger(Number(editingMail.arrivalNumber))) {
      toast({
        title: "Erreur",
        description: "Le numéro d'arrivée doit être un entier.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation de la date de signature
    if (editingMail.signatureDate && editingMail.arrivalDate) {
      if (!validateSignatureDate(editingMail.signatureDate, editingMail.arrivalDate)) {
        toast({
          title: "Erreur",
          description: "La date de signature ne peut pas être postérieure à la date d'arrivée.",
          variant: "destructive",
        });
        return;
      }
    }
    
    const isUnique = await checkArrivalNumberUnique(number, year, editingMail.id);
    if (isUnique) {
      setArrivalNumberError('');
      setSignatureDateError('');
      handleUpdateMail();
    }
  };

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
                onChange={(e) => {
                  setEditingMail({ ...editingMail, arrivalDate: e.target.value });
                  // Vérifier l'unicité si on a déjà un numéro
                  if (editingMail.arrivalNumber && e.target.value) {
                    const year = new Date(e.target.value).getFullYear();
                    checkArrivalNumberUnique(editingMail.arrivalNumber, year, editingMail.id);
                  }
                }}
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
                type="number"
                min="1"
                step="1"
                value={editingMail.arrivalNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setEditingMail({ ...editingMail, arrivalNumber: value });
                  validateArrivalNumber(value);
                }}
                onBlur={async () => {
                  if (editingMail.arrivalNumber && editingMail.arrivalDate) {
                    const year = new Date(editingMail.arrivalDate).getFullYear();
                    await checkArrivalNumberUnique(editingMail.arrivalNumber, year, editingMail.id);
                  }
                }}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              {arrivalNumberError && (
                <span className="text-xs text-red-400 flex items-center">
                  {checkingUnique ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400 mr-2"></div>
                      Vérification en cours...
                    </>
                  ) : (
                    arrivalNumberError
                  )}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSignatureDate" className="text-slate-200">Date de signature</Label>
              <Input
                id="editSignatureDate"
                type="date"
                value={editingMail.signatureDate}
                onChange={(e) => {
                  const newSignatureDate = e.target.value;
                  setEditingMail({ ...editingMail, signatureDate: newSignatureDate });
                  if (newSignatureDate && editingMail.arrivalDate) {
                    validateSignatureDate(newSignatureDate, editingMail.arrivalDate);
                  }
                }}
                max={editingMail.arrivalDate || undefined}
                className="bg-slate-700 border-slate-600 text-white"
              />
              {signatureDateError && (
                <span className="text-xs text-red-400">
                  {signatureDateError}
                </span>
              )}
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
            onClick={handleUpdateMailWithCheck}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={checkingUnique}
          >
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMailDialog;