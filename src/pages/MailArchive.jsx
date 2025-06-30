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
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const MailArchive = () => {
  const { toast } = useToast();
  const [archivedMails, setArchivedMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);

  useEffect(() => {
    loadArchivedMails();
  }, []);

  useEffect(() => {
    filterMails();
  }, [archivedMails, searchTerm, typeFilter]);

  const loadArchivedMails = () => {
    const assignments = JSON.parse(localStorage.getItem('gescourrier_assignments') || '[]');
    const incomingMails = JSON.parse(localStorage.getItem('gescourrier_incoming_mails') || '[]');
    const users = JSON.parse(localStorage.getItem('gescourrier_users') || '[]');

    const processedAssignments = assignments
      .filter(assignment => assignment.status === 'processed' || assignment.status === 'archived')
      .map(assignment => {
        const mail = incomingMails.find(m => m.id === assignment.mailId);
        const processedBy = users.find(u => u.id === assignment.processedBy);
        return {
          ...assignment,
          mail,
          processedByUser: processedBy,
        };
      })
      .filter(assignment => assignment.mail);

    setArchivedMails(processedAssignments);
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

  const handleReassign = (item) => {
    const assignments = JSON.parse(localStorage.getItem('gescourrier_assignments') || '[]');
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === item.id) {
        return { ...assignment, status: 'pending' };
      }
      return assignment;
    });

    localStorage.setItem('gescourrier_assignments', JSON.stringify(updatedAssignments));
    
    toast({
      title: "Courrier réaffecté",
      description: "Le courrier a été remis en attente.",
    });

    loadArchivedMails();
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
                          {item.mail?.attachment && (
                            <span className="flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              <a
                                href={item.mail.attachment}
                                download={item.mail.attachmentName || "piece-jointe"}
                                className="text-blue-400 underline ml-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Télécharger pièce arrivée
                              </a>
                            </span>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReassign(item)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du courrier archivé</DialogTitle>
            </DialogHeader>
            
            {selectedMail && (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400">Objet</Label>
                  <p className="text-white">{selectedMail.mail.subject}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Commentaire de traitement</Label>
                  <p className="text-white">{selectedMail.processingComment}</p>
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
      </div>
    </>
  );
};

export default MailArchive;