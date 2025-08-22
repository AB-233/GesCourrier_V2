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

const AddMailDialog = ({
  isOpen,
  setIsOpen,
  newMail,
  setNewMail,
  handleAddMail,
  mailTypes,
  sources,
}) => {
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
  const checkArrivalNumberUnique = async (number, year) => {
    setCheckingUnique(true);
    setArrivalNumberError('');
    try {
      const response = await fetch(`http://localhost:4000/api/incoming-mails/check-unique?year=${year}&number=${number}`);
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

  // Handler personnalisé pour l'ajout
  const handleAddMailWithCheck = async () => {
    const year = newMail.arrivalDate ? new Date(newMail.arrivalDate).getFullYear() : '';
    const number = newMail.arrivalNumber;
    if (!number || !year) {
      setArrivalNumberError('Veuillez saisir un numéro et une date valides.');
      return;
    }
    if (!newMail.arrivalNumber || isNaN(Number(newMail.arrivalNumber)) || !Number.isInteger(Number(newMail.arrivalNumber))) {
      toast({
        title: "Erreur",
        description: "Le numéro d'arrivée doit être un entier.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation de la date de signature
    if (newMail.signatureDate && newMail.arrivalDate) {
      if (!validateSignatureDate(newMail.signatureDate, newMail.arrivalDate)) {
        toast({
          title: "Erreur",
          description: "La date de signature ne peut pas être postérieure à la date d'arrivée.",
          variant: "destructive",
        });
        return;
      }
    }
    
    const isUnique = await checkArrivalNumberUnique(number, year);
    if (isUnique) {
      setArrivalNumberError('');
      setSignatureDateError('');
      handleAddMail();
    }
  };

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
                onChange={(e) => {
                  setNewMail({ ...newMail, arrivalDate: e.target.value });
                  // Vérifier l'unicité si on a déjà un numéro
                  if (newMail.arrivalNumber && e.target.value) {
                    const year = new Date(e.target.value).getFullYear();
                    checkArrivalNumberUnique(newMail.arrivalNumber, year);
                  }
                }}
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
                type="number"
                min="1"
                step="1"
                value={newMail.arrivalNumber}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setNewMail({ ...newMail, arrivalNumber: value });
                  validateArrivalNumber(value);
                }}
                onBlur={async () => {
                  if (newMail.arrivalNumber && newMail.arrivalDate) {
                    const year = new Date(newMail.arrivalDate).getFullYear();
                    await checkArrivalNumberUnique(newMail.arrivalNumber, year);
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
              <Label htmlFor="signatureDate" className="text-slate-200">Date de signature</Label>
              <Input
                id="signatureDate"
                type="date"
                value={newMail.signatureDate}
                onChange={(e) => {
                  const newSignatureDate = e.target.value;
                  setNewMail({ ...newMail, signatureDate: newSignatureDate });
                  if (newSignatureDate && newMail.arrivalDate) {
                    validateSignatureDate(newSignatureDate, newMail.arrivalDate);
                  }
                }}
                max={newMail.arrivalDate || undefined}
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
            onClick={handleAddMailWithCheck}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={checkingUnique}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMailDialog;