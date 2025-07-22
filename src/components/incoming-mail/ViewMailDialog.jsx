import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ViewMailDialog = ({ isOpen, setIsOpen, selectedMail }) => {
  if (!selectedMail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du courrier</DialogTitle>
          <DialogDescription className="text-slate-400">
            Visualisez les informations du courrier d'arrivée.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div>
            <Label className="text-slate-200">Date d'arrivée :</Label>
            <div>{selectedMail.arrivalDate}</div>
          </div>
          <div>
            <Label className="text-slate-200">Heure d'arrivée :</Label>
            <div>{selectedMail.arrivalTime}</div>
          </div>
          <div>
            <Label className="text-slate-200">Numéro d'arrivée :</Label>
            <div>{selectedMail.arrivalNumber}</div>
          </div>
          <div>
            <Label className="text-slate-200">Date de signature :</Label>
            <div>{selectedMail.signatureDate}</div>
          </div>
          <div>
            <Label className="text-slate-200">Numéro de signature :</Label>
            <div>{selectedMail.signatureNumber}</div>
          </div>
          <div>
            <Label className="text-slate-200">Structure émettrice :</Label>
            <div>{selectedMail.source}</div>
          </div>
          <div>
            <Label className="text-slate-200">Type de courrier :</Label>
            <div>{selectedMail.type}</div>
          </div>
          <div>
            <Label className="text-slate-200">Objet :</Label>
            <div>{selectedMail.subject}</div>
          </div>
          <div>
            <Label className="text-slate-200">Pièce jointe :</Label>
            {selectedMail.attachmentName ? (
              <a
                href={`data:application/octet-stream;base64,${selectedMail.attachment}`}
                download={selectedMail.attachmentName}
                className="text-blue-400 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedMail.attachmentName}
              </a>
            ) : (
              <span className="text-slate-400">Aucune</span>
            )}
          </div>
          <div>
            <Label className="text-slate-200">Nom du réceptionniste :</Label>
            <div>{selectedMail.receptionist}</div>
          </div>
          <div>
            <Label className="text-slate-200">Observations :</Label>
            <div>{selectedMail.observations}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMailDialog;