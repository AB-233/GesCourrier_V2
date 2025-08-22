import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  UserCheck, 
  Mail, 
  Users, 
  MessageSquare, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const MailAssignment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingMails, setIncomingMails] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Supprimer statusFilter et toute référence associée
  // const [statusFilter, setStatusFilter] = useState('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assignAllUsers, setAssignAllUsers] = useState(false);
  const [assignmentComment, setAssignmentComment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMails();
  }, [incomingMails, assignments, searchTerm]);

  const loadData = async () => {
    // Courriers arrivés
    const incomingRes = await fetch('http://localhost:4000/api/incoming-mails');
    const incomingData = await incomingRes.json();
    setIncomingMails(Array.isArray(incomingData) ? incomingData.map(m => ({ ...m, id: String(m.id) })) : []);

   
    // Utilisateurs
    const usersRes = await fetch('http://localhost:4000/api/users');
    const usersData = await usersRes.json();
    setUsers(Array.isArray(usersData) ? usersData.filter(u => u.isActive) : []);
    
    // Pour les assignments, il faut une API dédiée côté backend
    const assignmentsRes = await fetch('http://localhost:4000/api/assignments');
    const assignmentsData = await assignmentsRes.json();
    setAssignments(Array.isArray(assignmentsData) ? assignmentsData.map(a => ({ ...a, mailId: String(a.mailId) })) : []);
  };

  const filterMails = () => {
    console.log(
      "incomingMails ids:", incomingMails.map(m => m.id),
      "assignedMailIds:", assignments.map(a => a.mailId)
    );
    console.log(
      "Types incomingMails ids:", incomingMails.map(m => typeof m.id),
      "Types assignedMailIds:", assignments.map(a => typeof a.mailId)
    );
    // Exclure les courriers qui ont déjà une affectation (comparaison robuste sur les types)
    const assignedMailIds = assignments.map(a => String(a.mailId));
    let filtered = incomingMails.filter(mail => !assignedMailIds.includes(String(mail.id)));

    // Appliquer le filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(mail =>
        (mail.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mail.arrivalNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mail.source || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tri du plus récent au plus ancien
    filtered = filtered.sort((a, b) => {
      const dateA = a.arrivalDate ? new Date(`${a.arrivalDate}T${a.arrivalTime || '00:00'}`) : new Date(0);
      const dateB = b.arrivalDate ? new Date(`${b.arrivalDate}T${b.arrivalTime || '00:00'}`) : new Date(0);
      return dateB - dateA;
    });

    setFilteredMails(filtered);
  };

  const userAssignments = assignments
  .filter(
    assignment =>
      assignment.assignedTo.includes(user?.id) &&
      assignment.status === 'pending'
  )
  .map(assignment => {
   
  });

  const handleAssignMail = async () => {
    if (selectedUsers.length === 0) {
      toast({ title: "Erreur", description: "Veuillez sélectionner au moins un utilisateur", variant: "destructive" });
      return;
    }
    const assignment = {
      mailId: selectedMail.id,
      assignedTo: selectedUsers,
      assignedBy: user.id,
      comment: assignmentComment,
      assignedAt: new Date().toISOString(),
      status: 'pending'
    };
    const res = await fetch('http://localhost:4000/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment)
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Affectation réussie", description: "Le courrier a été affecté." });
      setIsAssignDialogOpen(false);
      setSelectedMail(null);
      setSelectedUsers([]);
      setAssignmentComment('');
      await loadData(); // recharge bien les données
    } else {
      toast({ title: "Erreur", description: data.error, variant: "destructive" });
    }
  };
  const handleOpenAssignDialog = (mail) => {
    setSelectedMail(mail);
    setAssignAllUsers(false);
    setSelectedUsers(mail.assignment ? mail.assignment.assignedTo : []);
    setAssignmentComment(mail.assignment ? mail.assignment.comment : '');
    setIsAssignDialogOpen(true);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unassigned':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'archived':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'unassigned':
        return 'Non affecté';
      case 'pending':
        return 'En attente';
      case 'processed':
        return 'Traité';
      case 'archived':
        return 'Archivé';
      default:
        return 'Non affecté';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned':
        return 'bg-red-600';
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
        <title>Affectation des courriers - GesCourrier</title>
        <meta name="description" content="Affectation des courriers aux utilisateurs" />
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
                <UserCheck className="mr-3 h-8 w-8" />
                Affectation des courriers
              </h1>
              <p className="text-slate-300 mt-2">
                Affectez les courriers d'arrivée aux utilisateurs concernés
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                {/* Supprime la colonne Statut du filtre */}
                {/* <div className="space-y-2">
                  <Label className="text-slate-200">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">Tous les statuts</SelectItem>
                      <SelectItem value="unassigned" className="text-white hover:bg-slate-700">Non affectés</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-slate-700">En attente</SelectItem>
                      <SelectItem value="processed" className="text-white hover:bg-slate-700">Traités</SelectItem>
                      <SelectItem value="archived" className="text-white hover:bg-slate-700">Archivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      // setStatusFilter('all'); // Supprimer setStatusFilter
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
                Courriers à affecter ({filteredMails.length})
              </CardTitle>
              <CardDescription className="text-slate-400">
                Liste des courriers d'arrivée et leur statut d'affectation
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
                            <span className={`px-2 py-1 text-xs rounded-full text-white flex items-center ${getStatusColor(mail.status)}`}>
                              {getStatusIcon(mail.status)}
                              <span className="ml-1">{getStatusText(mail.status)}</span>
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-1">{mail.subject}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(mail.arrivalDate).toLocaleDateString('fr-FR')}
                            </span>
                            {mail.assignment && mail.assignment.assignedTo.length > 0 && (
                              <span className="flex items-center">
                                <Users className="mr-1 h-3 w-3" />
                                Affecté à {mail.assignment.assignedTo.length} utilisateur(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleOpenAssignDialog(mail)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          {mail.status === 'unassigned' ? 'Affecter' : 'Affecter'}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Affecter le courrier</DialogTitle>
              <DialogDescription className="text-slate-400">
                Sélectionnez les utilisateurs et ajoutez un commentaire
              </DialogDescription>
            </DialogHeader>
            
            {selectedMail && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Courrier à affecter</h4>
                  <p className="text-sm text-slate-300">{selectedMail.arrivalNumber} - {selectedMail.subject}</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-200">Sélectionner les utilisateurs</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="assign-all-users"
                      type="checkbox"
                      checked={assignAllUsers}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAssignAllUsers(checked);
                        setSelectedUsers(checked ? users.map(u => u.id) : []);
                      }}
                    />
                    <Label htmlFor="assign-all-users" className="text-slate-200">Affecter à tous les utilisateurs</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-slate-700 rounded-md">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/30"
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          disabled={assignAllUsers}
                          className="border-slate-500"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`user-${user.id}`}
                            className="text-sm font-medium text-white cursor-pointer"
                          >
                            {user.firstName} {user.lastName}
                          </label>
                          <p className="text-xs text-slate-400">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400">{selectedUsers.length} utilisateur(s) sélectionné(s)</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-slate-200">Commentaire d'affectation</Label>
                  <Textarea
                    id="comment"
                    placeholder="Ajoutez des instructions..."
                    value={assignmentComment}
                    onChange={(e) => setAssignmentComment(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAssignMail}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Affecter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default MailAssignment;