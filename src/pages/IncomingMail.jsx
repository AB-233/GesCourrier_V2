import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Paperclip,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AddMailDialog from '@/components/incoming-mail/AddMailDialog';
import ViewMailDialog from '@/components/incoming-mail/ViewMailDialog';
import EditMailDialog from '@/components/incoming-mail/EditMailDialog';

const IncomingMail = () => {
  const { toast } = useToast();
  const [mails, setMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [editingMail, setEditingMail] = useState(null);

  const [newMail, setNewMail] = useState({
    arrivalDate: '',
    arrivalTime: '',
    arrivalNumber: '',
    signatureDate: '',
    signatureNumber: '',
    source: '',
    type: '',
    subject: '',
    attachment: '',
    receptionist: '',
    observations: ''
  });

  const mailTypes = [
    'Lettre', 'Avis', 'BE', 'ST', 'FC', 'OM', 
    'Décisions', 'Arrêtés', 'Décret', 'Lois', 'Autres'
  ];

  const sources = [
    'Cabinet', 'DRH', 'CPS', 'CADD', 'DNDS', 'CNAPESS', 
    'INPS', 'CMSS', 'CANAM', 'ANAM', 'AMAMUS', 'UTM', 'ODHD', 'Autres'
  ];

  useEffect(() => {
    loadMails();
  }, []);

  useEffect(() => {
    filterMails();
  }, [mails, searchTerm, typeFilter, sourceFilter]);

  const loadMails = () => {
    const storedMails = JSON.parse(localStorage.getItem('gescourrier_incoming_mails') || '[]');
    setMails(storedMails);
  };

  const filterMails = () => {
    let filtered = mails;

    if (searchTerm) {
      filtered = filtered.filter(mail => 
        mail.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mail.arrivalNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mail.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(mail => mail.type === typeFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(mail => mail.source === sourceFilter);
    }

    // Tri robuste : si date ou heure manquante, on considère la date la plus ancienne
    filtered = filtered.sort((a, b) => {
      const dateA = a.arrivalDate
        ? new Date(`${a.arrivalDate}T${a.arrivalTime || '00:00'}`)
        : new Date(0);
      const dateB = b.arrivalDate
        ? new Date(`${b.arrivalDate}T${b.arrivalTime || '00:00'}`)
        : new Date(0);
      return dateB - dateA;
    });

    setFilteredMails(filtered);
  };

  const handleAddMail = () => {
    if (!newMail.arrivalDate || !newMail.arrivalNumber || !newMail.subject || !newMail.source || !newMail.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const mail = {
      id: Date.now().toString(),
      ...newMail,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedMails = [...mails, mail];
    setMails(updatedMails);
    localStorage.setItem('gescourrier_incoming_mails', JSON.stringify(updatedMails));

    toast({
      title: "Courrier ajouté",
      description: "Le courrier d'arrivée a été enregistré avec succès.",
    });

    setNewMail({
      arrivalDate: '',
      arrivalTime: '',
      arrivalNumber: '',
      signatureDate: '',
      signatureNumber: '',
      source: '',
      type: '',
      subject: '',
      attachment: '',
      receptionist: '',
      observations: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleViewMail = (mail) => {
    setSelectedMail(mail);
    setIsViewDialogOpen(true);
  };
  
  const handleEditClick = (mail) => {
    setEditingMail({ ...mail });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMail = () => {
    if (!editingMail.arrivalDate || !editingMail.arrivalNumber || !editingMail.subject || !editingMail.source || !editingMail.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const updatedMails = mails.map(m => m.id === editingMail.id ? editingMail : m);
    setMails(updatedMails);
    localStorage.setItem('gescourrier_incoming_mails', JSON.stringify(updatedMails));

    toast({
      title: "Courrier modifié",
      description: "Le courrier d'arrivée a été mis à jour avec succès.",
    });

    setEditingMail(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteMail = (mailId) => {
    const updatedMails = mails.filter(mail => mail.id !== mailId);
    setMails(updatedMails);
    localStorage.setItem('gescourrier_incoming_mails', JSON.stringify(updatedMails));
    
    toast({
      title: "Courrier supprimé",
      description: "Le courrier a été supprimé avec succès.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Courriers arrivée - GesCourrier</title>
        <meta name="description" content="Gestion des courriers d'arrivée" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center">
                <Mail className="mr-3 h-8 w-8" />
                Courriers arrivée
              </h1>
              <p className="text-slate-300 mt-2">
                Enregistrement et gestion des courriers reçus
              </p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau courrier
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtres et recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-slate-200">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Objet, numéro, source..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-200">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">Tous les types</SelectItem>
                      {mailTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-200">Source</Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">Toutes les sources</SelectItem>
                      {sources.map((source) => (
                        <SelectItem key={source} value={source} className="text-white hover:bg-slate-700">
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setSourceFilter('all');
                    }}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Courriers d'arrivée ({filteredMails.length})
              </CardTitle>
              <CardDescription className="text-slate-400">
                Liste des courriers reçus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMails.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-400">Aucun courrier trouvé</p>
                  </div>
                ) : (
                  filteredMails.map((mail, index) => (
                    <motion.div
                      key={mail.id}
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
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-white font-medium">{mail.arrivalNumber}</p>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-600 text-white">
                              {mail.type}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">
                              {mail.source}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-1">{mail.subject}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(mail.arrivalDate).toLocaleDateString('fr-FR')}
                            </span>
                            {mail.attachment && (
                              <span className="flex items-center">
                                <Paperclip className="mr-1 h-3 w-3" />
                                <a
                                  href={mail.attachment}
                                  download={mail.attachmentName || "piece-jointe"}
                                  className="text-blue-400 underline ml-1"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Télécharger
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
                          onClick={() => handleViewMail(mail)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(mail)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMail(mail.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AddMailDialog
          isOpen={isAddDialogOpen}
          setIsOpen={setIsAddDialogOpen}
          newMail={newMail}
          setNewMail={setNewMail}
          handleAddMail={handleAddMail}
          mailTypes={mailTypes}
          sources={sources}
        />
        
        <ViewMailDialog
          isOpen={isViewDialogOpen}
          setIsOpen={setIsViewDialogOpen}
          selectedMail={selectedMail}
        />
        
        <EditMailDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          editingMail={editingMail}
          setEditingMail={setEditingMail}
          handleUpdateMail={handleUpdateMail}
          mailTypes={mailTypes}
          sources={sources}
        />
      </div>
    </>
  );
};

export default IncomingMail;