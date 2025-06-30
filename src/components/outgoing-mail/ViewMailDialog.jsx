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
import { Label } from '@/components/ui/label';

const ViewMailDialog = ({ isOpen, setIsOpen, selectedMail }) => {
  if (!selectedMail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du courrier de départ</DialogTitle>
          <DialogDescription className="text-slate-400">
            Informations complètes du courrier de départ.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Numéro de signature</Label>
              <p className="text-white font-medium">{selectedMail.signatureNumber}</p>
            </div>
            <div>
              <Label className="text-slate-400">Date de signature</Label>
              <p className="text-white">{new Date(selectedMail.signatureDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div>
            <Label className="text-slate-400">Destination</Label>
            <p className="text-white">{selectedMail.destination}</p>
          </div>
          <div>
            <Label className="text-slate-400">Objet</Label>
            <p className="text-white">{selectedMail.subject}</p>
          </div>
          {selectedMail.transmissionDate && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Date de transmission</Label>
                <p className="text-white">{new Date(selectedMail.transmissionDate).toLocaleDateString('fr-FR')}</p>
              </div>
              {selectedMail.transmissionNumber && (
                <div>
                  <Label className="text-slate-400">Numéro de transmission</Label>
                  <p className="text-white">{selectedMail.transmissionNumber}</p>
                </div>
              )}
            </div>
          )}
          {selectedMail.observations && (
            <div>
              <Label className="text-slate-400">Observations</Label>
              <p className="text-white">{selectedMail.observations}</p>
            </div>
          )}
          {selectedMail.attachment && (
            <div>
              <Label className="text-slate-400">Pièce jointe</Label>
              <p className="text-white">{selectedMail.attachment}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMailDialog;