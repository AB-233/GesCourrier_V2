import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Archive, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye, 
  RotateCcw,
  Mail,
  Send,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MailArchive = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [archivedMails, setArchivedMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [reassignTargets, setReassignTargets] = useState([]);
  const [reassignAll, setReassignAll] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  

  useEffect(() => {
    loadArchivedMails();
    loadUsers();
  }, []);

  useEffect(() => {
    filterMails();
  }, [archivedMails, searchTerm, typeFilter]);

  const loadArchivedMails = async () => {
    // Récupère les données depuis l'API
    const assignmentsRes = await fetch('http://localhost:4000/api/assignments');
    const assignmentsData = await assignmentsRes.json();

    const incomingRes = await fetch('http://localhost:4000/api/incoming-mails');
    const incomingData = await incomingRes.json();

    const usersRes = await fetch('http://localhost:4000/api/users');
    const usersData = await usersRes.json();

    // Filtre les assignments archivés ou traités
    const processedAssignments = assignmentsData
      .filter(assignment => assignment.status === 'processed' || assignment.status === 'archived')
      .map(assignment => {
        const mail = incomingData.find(m => String(m.id) === String(assignment.mailId));
        const processedBy = usersData.find(u => String(u.id) === String(assignment.processedBy));
        return {
          ...assignment,
          mail,
          processedByUser: processedBy,
        };
      })
      .filter(assignment => assignment.mail);

    setArchivedMails(processedAssignments);
  };
  
  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users');
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleDownloadIncomingAttachment = async (mailId, filename) => {
    try {
      const res = await fetch(`http://localhost:4000/api/incoming-mails/${mailId}/attachment`);
      if (!res.ok) {
        toast({ title: 'Erreur', description: 'Pièce jointe introuvable', variant: 'destructive' });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'piece-jointe';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: 'Erreur', description: "Erreur réseau lors du téléchargement", variant: 'destructive' });
    }
  };

  const filterMails = () => {
    let filtered = archivedMails;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mail.arrivalNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.mail.type === typeFilter);
    }

    // Tri du plus récent au plus ancien selon la date d'arrivée du courrier
    filtered = filtered.sort((a, b) => {
      const dateA = a.mail.arrivalDate
        ? new Date(`${a.mail.arrivalDate}T${a.mail.arrivalTime || '00:00'}`)
        : new Date(0);
      const dateB = b.mail.arrivalDate
        ? new Date(`${b.mail.arrivalDate}T${b.mail.arrivalTime || '00:00'}`)
        : new Date(0);
      return dateB - dateA;
    });

    setFilteredMails(filtered);
  };

  const handleViewMail = (item) => {
    setSelectedMail(item);
    setIsViewDialogOpen(true);
  };
  
  const submitReassign = async () => {
    try {
      if (!selectedMail) return;
      const targets = reassignAll ? allUsers.map(u => u.id) : reassignTargets;
      const res = await fetch(`http://localhost:4000/api/assignments/${selectedMail.id}/reassign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: targets, assignedBy: user?.id, comment: selectedMail.processingComment || null })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Courrier réaffecté', description: 'La réaffectation a été effectuée.' });
        setIsReassignDialogOpen(false);
        setSelectedMail(null);
        setReassignTargets([]);
        setReassignAll(false);
        loadArchivedMails();
      } else {
        toast({ title: 'Erreur', description: data.error || 'Réaffectation échouée', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Erreur réseau', variant: 'destructive' });
    }
  };

  const handleReassign = async (item) => {
    const res = await fetch(`http://localhost:4000/api/assignments/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' })
    });
    const data = await res.json();
    if (data.success) {
      toast({
        title: "Courrier réaffecté",
        description: "Le courrier a été remis en attente.",
      });
      loadArchivedMails();
    } else {
      toast({ title: "Erreur", description: data.error, variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Archive des courriers - GesCourrier</title>
        <meta name="description" content="Archive des courriers traités" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold gradient-text flex items-center">
            <Archive className="mr-3 h-8 w-8" />
            Archive des courriers
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-slate-200">Rechercher</Label>
                  <Input
                    id="search"
                    placeholder="Objet, numéro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">Tous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Courriers archivés ({filteredMails.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMails.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{item.mail.arrivalNumber}</p>
                        <p className="text-slate-300 text-sm mb-1">{item.mail.subject}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            Traité par {item.processedByUser?.firstName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Traité le {new Date(item.processedAt).toLocaleDateString('fr-FR')}
                          </span>
                          {item.mail?.hasAttachment && (
                            <button
                              type="button"
                              onClick={() => handleDownloadIncomingAttachment(item.mail.id, item.mail.attachmentName)}
                              className="flex items-center text-blue-400 underline ml-1"
                            >
                              <Paperclip className="mr-1 h-3 w-3" />
                              Télécharger pièce arrivée
                            </button>
                          )}
                          {item.responseFile && (
                            <span className="flex items-center">
                              <Send className="mr-1 h-3 w-3" />
                              <a
                                href={item.responseFile}
                                download={"reponse-" + (item.mail?.arrivalNumber || "courrier")}
                                className="text-green-400 underline ml-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Télécharger réponse
                              </a>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewMail(item)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(['ADMIN','DN','DNA','SECRETARIAT'].includes(user?.role)) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMail(item);
                            setIsReassignDialogOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du courrier archivé</DialogTitle>
            </DialogHeader>
            
            {selectedMail && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-slate-400">Numéro d'arrivée</Label>
                    <div className="text-white">{selectedMail.mail.arrivalNumber || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Objet</Label>
                    <div className="text-white">{selectedMail.mail.subject || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Date d'arrivée</Label>
                    <div className="text-white">{selectedMail.mail.arrivalDate || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Heure d'arrivée</Label>
                    <div className="text-white">{selectedMail.mail.arrivalTime || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Type</Label>
                    <div className="text-white">{selectedMail.mail.type || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Source</Label>
                    <div className="text-white">{selectedMail.mail.source || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Date de signature</Label>
                    <div className="text-white">{selectedMail.mail.signatureDate || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Numéro de signature</Label>
                    <div className="text-white">{selectedMail.mail.signatureNumber || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Réceptionniste</Label>
                    <div className="text-white">{selectedMail.mail.receptionist || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Créé le</Label>
                    <div className="text-white">{selectedMail.mail.createdAt ? new Date(selectedMail.mail.createdAt).toLocaleString('fr-FR') : '-'}</div>
                  </div>
                  {selectedMail.mail?.hasAttachment && (
                    <div className="md:col-span-2 text-xs text-slate-300">
                      <button
                        type="button"
                        onClick={() => handleDownloadIncomingAttachment(selectedMail.mail.id, selectedMail.mail.attachmentName)}
                        className="flex items-center text-blue-400 underline"
                      >
                        <Paperclip className="mr-1 h-3 w-3" />
                        Télécharger la pièce jointe
                      </button>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <Label className="text-slate-400">Observations</Label>
                    <div className="text-white whitespace-pre-wrap">{selectedMail.mail.observations || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-400">Commentaire de traitement</Label>
                    <div className="text-white whitespace-pre-wrap">{selectedMail.processingComment || '-'}</div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                onClick={() => setIsViewDialogOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
  <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-xl">
    <DialogHeader>
      <DialogTitle>Réaffecter le courrier</DialogTitle>
      <DialogDescription>Sélectionnez des utilisateurs cibles ou tous les utilisateurs.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label className="text-slate-200 mb-2 block">Réaffecter à</Label>
        <div className="max-h-60 overflow-y-auto border border-slate-700 rounded p-2">
          {allUsers.map(u => (
            <label key={u.id} className="flex items-center space-x-2 text-sm text-slate-300 py-1">
              <input
                type="checkbox"
                checked={reassignTargets.includes(u.id)}
                onChange={(e) => {
                  if (e.target.checked) setReassignTargets(prev => Array.from(new Set([...prev, u.id])));
                  else setReassignTargets(prev => prev.filter(id => id !== u.id));
                }}
              />
              <span>{u.firstName} {u.lastName} ({u.role})</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="reassignAll" checked={reassignAll} onChange={(e)=>setReassignAll(e.target.checked)} />
        <Label htmlFor="reassignAll" className="text-slate-200">Réaffecter à tous les utilisateurs</Label>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={()=>setIsReassignDialogOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Annuler</Button>
      <Button onClick={submitReassign} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Confirmer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </>
  );
};

export default MailArchive;