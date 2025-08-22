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
  destinations,
 }) => {
  const [signatureNumberError, setSignatureNumberError] = useState('');
  const [checkingUnique, setCheckingUnique] = useState(false);

  // Validation en temps réel du numéro de signature
  const validateSignatureNumber = (value) => {
    if (!value) {
      setSignatureNumberError('');
      return;
    }
    
    if (isNaN(Number(value)) || !Number.isInteger(Number(value)) || Number(value) <= 0) {
      setSignatureNumberError('Le numéro de signature doit être un entier positif.');
      return;
    }
    
    setSignatureNumberError('');
  };

  // Fonction pour vérifier l'unicité du numéro de signature pour l'année
  const checkSignatureNumberUnique = async (number, year) => {
    setCheckingUnique(true);
    setSignatureNumberError('');
    try {
      const response = await fetch(`http://localhost:4000/api/outgoing-mails/check-unique?year=${year}&number=${number}`);
      const data = await response.json();
      if (!data.unique) {
        setSignatureNumberError('Ce numéro de signature existe déjà pour cette année.');
        return false;
      }
      return true;
    } catch (err) {
      setSignatureNumberError("Erreur lors de la vérification d'unicité.");
      return false;
    } finally {
      setCheckingUnique(false);
    }
  };

  // Handler personnalisé pour l'ajout
  const handleAddMailWithCheck = async () => {
    const year = newMail.signatureDate ? new Date(newMail.signatureDate).getFullYear() : '';
    const number = newMail.signatureNumber;
    if (!number || !year) {
      setSignatureNumberError('Veuillez saisir un numéro et une date valides.');
      return;
    }
    if (!newMail.signatureNumber || isNaN(Number(newMail.signatureNumber)) || !Number.isInteger(Number(newMail.signatureNumber))) {
      toast({
        title: "Erreur",
        description: "Le numéro de signature doit être un entier.",
        variant: "destructive",
      });
      return;
    }
    const isUnique = await checkSignatureNumberUnique(number, year);
    if (isUnique) {
      setSignatureNumberError('');
      try {
        await handleAddMail();
        // Fermer le formulaire après un enregistrement réussi
        setIsOpen(false);
        // Réinitialiser le formulaire
        setNewMail({
          signatureDate: '',
          signatureNumber: '',
          destination: '',
          subject: '',
          attachment: '',
          attachmentName: '',
          receptionist: '',
          transmissionDate: '',
          transmissionTime: '',
          transmissionNumber: '',
          observations: ''
        });
      } catch (error) {
        // En cas d'erreur, ne pas fermer le formulaire
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer un nouveau courrier de départ</DialogTitle>
          <DialogDescription className="text-slate-400">
            Saisissez les informations du courrier de départ.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signatureDate" className="text-slate-200">Date de signature *</Label>
              <Input
                id="signatureDate"
                type="date"
                value={newMail.signatureDate}
                onChange={(e) => {
                  setNewMail({ ...newMail, signatureDate: e.target.value });
                  // Vérifier l'unicité si on a déjà un numéro
                  if (newMail.signatureNumber && e.target.value) {
                    const year = new Date(e.target.value).getFullYear();
                    checkSignatureNumberUnique(newMail.signatureNumber, year);
                  }
                }}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureNumber" className="text-slate-200">Numéro de signature *</Label>
              <Input
                id="signatureNumber"
                type="number"
                min="1"
                step="1"
                value={newMail.signatureNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setNewMail({ ...newMail, signatureNumber: value });
                  validateSignatureNumber(value);
                }}
                onBlur={async () => {
                  if (newMail.signatureNumber && newMail.signatureDate) {
                    const year = new Date(newMail.signatureDate).getFullYear();
                    await checkSignatureNumberUnique(newMail.signatureNumber, year);
                  }
                }}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              {signatureNumberError && (
                <span className="text-xs text-red-400 flex items-center">
                  {checkingUnique ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400 mr-2"></div>
                      Vérification en cours...
                    </>
                  ) : (
                    signatureNumberError
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Structure réceptrice *</Label>
            <Select value={newMail.destination} onValueChange={(value) => setNewMail({ ...newMail, destination: value })}>
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
                className="bg-slate-700 border-slate-600 text-white"
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transmissionDate" className="text-slate-200">Date de transmission</Label>
              <Input
                id="transmissionDate"
                type="date"
                value={newMail.transmissionDate}
                onChange={(e) => setNewMail({ ...newMail, transmissionDate: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmissionTime" className="text-slate-200">Heure de transmission</Label>
              <Input
                id="transmissionTime"
                type="time"
                value={newMail.transmissionTime}
                onChange={(e) => setNewMail({ ...newMail, transmissionTime: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmissionNumber" className="text-slate-200">Numéro de transmission</Label>
              <Input
                id="transmissionNumber"
                placeholder="Ex: TRANS-2024-001"
                value={newMail.transmissionNumber}
                onChange={(e) => setNewMail({ ...newMail, transmissionNumber: e.target.value })}
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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