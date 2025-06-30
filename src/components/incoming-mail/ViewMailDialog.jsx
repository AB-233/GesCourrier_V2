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
          <DialogTitle>Détails du courrier</DialogTitle>
          <DialogDescription className="text-slate-400">
            Informations complètes du courrier d'arrivée.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Numéro d'arrivée</Label>
              <p className="text-white font-medium">{selectedMail.arrivalNumber}</p>
            </div>
            <div>
              <Label className="text-slate-400">Date d'arrivée</Label>
              <p className="text-white">{new Date(selectedMail.arrivalDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Type</Label>
              <p className="text-white">{selectedMail.type}</p>
            </div>
            <div>
              <Label className="text-slate-400">Source</Label>
              <p className="text-white">{selectedMail.source}</p>
            </div>
          </div>
          <div>
            <Label className="text-slate-400">Objet</Label>
            <p className="text-white">{selectedMail.subject}</p>
          </div>
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMailDialog;