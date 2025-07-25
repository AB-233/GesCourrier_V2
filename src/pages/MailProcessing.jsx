import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  FileText, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const MailProcessing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [processingComment, setProcessingComment] = useState('');
  const [responseFile, setResponseFile] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [myAssignments, searchTerm, statusFilter]);

  const loadData = async () => {
    // Assignments (il faut une API dédiée côté backend)
    const assignmentsRes = await fetch('http://localhost:4000/api/assignments');
    const assignmentsData = await assignmentsRes.json();
    setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

    // Courriers arrivés
    const mailsRes = await fetch('http://localhost:4000/api/incoming-mails');
    const mailsData = await mailsRes.json();

    // Utilisateurs
    const usersRes = await fetch('http://localhost:4000/api/users');
    const usersData = await usersRes.json();

    // Filtrer les assignments pour l'utilisateur courant
    const userAssignments = assignmentsData
      .filter(
        assignment =>
          assignment.assignedTo.includes(user?.id) &&
          assignment.status === 'pending'
      )
      .map(assignment => {
        const mail = mailsData.find(m => m.id === assignment.mailId);
        const assignedBy = usersData.find(u => u.id === assignment.assignedBy);
        return {
          ...assignment,
          mail,
          assignedByUser: assignedBy
        };
      })
      .filter(assignment => assignment.mail);

    setMyAssignments(userAssignments);
  };

  const filterAssignments = () => {
    let filtered = myAssignments;

    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.mail.arrivalNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
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

    setFilteredAssignments(filtered);
  };

  const handleProcessMail = async () => {
    if (!processingComment.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter un commentaire de traitement",
        variant: "destructive",
      });
      return;
    }
    const res = await fetch(`http://localhost:4000/api/assignments/${selectedAssignment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'processed',
        processedAt: new Date().toISOString(),
        processedBy: user.id,
        processingComment,
        responseFile,
        responseFileName: responseFile ? 'reponse.pdf' : null // adapte si besoin
      })
    });
    const data = await res.json();
    if (data.success) {
      toast({
        title: "Courrier traité",
        description: "Le courrier a été marqué comme traité avec succès.",
      });
      setIsProcessDialogOpen(false);
      setSelectedAssignment(null);
      setProcessingComment('');
      setResponseFile('');
      loadData();
    } else {
      toast({ title: "Erreur", description: data.error, variant: "destructive" });
    }
  };
  const handleOpenProcessDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setProcessingComment(assignment.processingComment || '');
    setResponseFile(assignment.responseFile || '');
    setIsProcessDialogOpen(true);
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600';
      case 'processed':
        return 'bg-green-600';
      case 'archived':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <>
      <Helmet>
        <title>Traitement des courriers - GesCourrier</title>
        <meta name="description" content="Traitement des courriers qui vous ont été affectés" />
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
                <FileText className="mr-3 h-8 w-8" />
                Traitement des courriers
              </h1>
              <p className="text-slate-300 mt-2">
                Traitez les courriers qui vous ont été affectés
              </p>
            </div>
          </div>
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
                Filtres et recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-slate-200">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Objet, numéro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-200">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">Tous les statuts</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-slate-700">En attente</SelectItem>
                      <SelectItem value="processed" className="text-white hover:bg-slate-700">Traités</SelectItem>
                      <SelectItem value="archived" className="text-white hover:bg-slate-700">Archivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
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
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Mes courriers affectés ({filteredAssignments.length})
              </CardTitle>
              <CardDescription className="text-slate-400">
                Courriers qui vous ont été affectés pour traitement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-400">Aucun courrier affecté trouvé</p>
                  </div>
                ) : (
                  filteredAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-white font-medium">{assignment.mail.arrivalNumber}</p>
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-1">{assignment.mail.subject}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              Affecté par {assignment.assignedByUser?.firstName}
                            </span>
                            {assignment.mail?.attachment && (
                              <span className="flex items-center">
                                <Paperclip className="mr-1 h-3 w-3" />
                                <a
                                  href={assignment.mail.attachment}
                                  download={assignment.mail.attachmentName || "piece-jointe"}
                                  className="text-blue-400 underline ml-1"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Télécharger la pièce jointe
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
                          onClick={() => handleViewAssignment(assignment)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {assignment.status === 'pending' && (
                          <Button
                            onClick={() => handleOpenProcessDialog(assignment)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Traiter
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Traiter le courrier</DialogTitle>
              <DialogDescription className="text-slate-400">
                Ajoutez votre commentaire et joignez une réponse si nécessaire
              </DialogDescription>
            </DialogHeader>
            
            {selectedAssignment && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Courrier à traiter</h4>
                  <p className="text-sm text-slate-300">{selectedAssignment.mail.arrivalNumber} - {selectedAssignment.mail.subject}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processingComment" className="text-slate-200">Commentaire de traitement *</Label>
                  <Textarea
                    id="processingComment"
                    placeholder="Décrivez le traitement effectué..."
                    value={processingComment}
                    onChange={(e) => setProcessingComment(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responseFile" className="text-slate-200">Fichier de réponse (optionnel)</Label>
                  <Input
                    id="responseFile"
                    type="file"
                    accept="*"
                    className="bg-slate-700 border-slate-600 text-white"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          setResponseFile(ev.target.result); // base64 string
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setResponseFile('');
                      }
                    }}
                  />
                  {responseFile && (
                    <span className="text-xs text-slate-300">Fichier chargé</span>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProcessDialogOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Annuler
              </Button>
              <Button
                onClick={handleProcessMail}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Marquer comme traité
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'affectation</DialogTitle>
            </DialogHeader>
            
            {selectedAssignment && (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400">Objet</Label>
                  <p className="text-white">{selectedAssignment.mail.subject}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Instructions</Label>
                  <p className="text-white">{selectedAssignment.comment || "Aucune instruction"}</p>
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

export default MailProcessing;