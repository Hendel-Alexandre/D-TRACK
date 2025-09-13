import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      timesheets: "Timesheets", 
      tasks: "Tasks",
      projects: "Projects",
      notes: "Notes",
      reports: "Reports",
      team: "Team",
      settings: "Settings",
      calendar: "Calendar",
      messages: "Messages",
      history: "History",
      
      // Page Titles and Descriptions
      dashboardWelcome: "Welcome back, {{name}}!",
      dashboardSubtitle: "Here's what's happening with your time tracking today",
      
      calendarTitle: "Calendar",
      calendarDescription: "Manage your tasks and schedule",
      
      tasksTitle: "Tasks",
      tasksDescription: "Organize and track your tasks",
      
      projectsTitle: "Projects", 
      projectsDescription: "Manage your projects and track progress",
      
      notesTitle: "Notes",
      notesDescription: "Capture your thoughts and ideas",
      
      reportsTitle: "Reports",
      reportsDescription: "Analyze your time tracking data",
      
      settingsTitle: "Settings",
      settingsDescription: "Manage your account and preferences",
      
      teamTitle: "Team",
      teamDescription: "Connect with your team members and collaborate effectively",
      
      timesheetsTitle: "Timesheets",
      timesheetsDescription: "Track your time and manage work hours",
      
      historyTitle: "History",
      historyDescription: "Track all your actions and changes",
      
      // Auth
      login: "Login",
      logout: "Logout",
      signup: "Create Account",
      signupSubtitle: "Join D-Track Platform",
      welcomeBack: "Welcome Back",
      forgotPassword: "Forgot Password",
      firstName: "First Name",
      lastName: "Last Name", 
      email: "Email",
      password: "Password",
      department: "Department",
      
      // Forms and Actions
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      close: "Close",
      create: "Create",
      update: "Update",
      submit: "Submit",
      
      // Buttons and CTAs
      newTask: "New Task",
      newProject: "New Project", 
      newNote: "New Note",
      addEntry: "Add Entry",
      createTask: "Create Task",
      createProject: "Create Project",
      createNote: "Create Note",
      createNewTask: "Create New Task",
      createNewProject: "Create New Project",
      createNewNote: "Create New Note",
      editTask: "Edit Task",
      editNote: "Edit Note",
      updateTask: "Update Task",
      updateNote: "Update Note",
      saveChanges: "Save Changes",
      startTracking: "Start Tracking",
      
      // Form Labels
      title: "Title",
      taskTitle: "Task Title",
      projectName: "Project Name",
      description: "Description",
      status: "Status",
      priority: "Priority",
      dueDate: "Due Date",
      content: "Content",
      
      // Placeholders
      enterEmail: "Enter your email",
      enterPassword: "Enter your password", 
      createPassword: "Create a password",
      firstName_placeholder: "First name",
      lastName_placeholder: "Last name",
      noteTitle: "Note title...",
      noteContent: "Write your note content here...",
      searchTasks: "Search tasks...",
      searchProjects: "Search projects...",
      searchNotes: "Search notes...",
      searchTeam: "Search team members...",
      searchTimeEntries: "Search time entries...",
      searchConversations: "Search conversations...",
      typeMessage: "Type your message...",
      workDescription: "What did you work on?",
      selectProject: "Select project",
      selectTask: "Select task",
      selectDepartment: "Select your department",
      selectTime: "Select time",
      pickDate: "Pick a date",
      groupName: "Group name",
      
      // Departments
      marketing: "Marketing",
      it: "IT", 
      support: "Support",
      finance: "Finance",
      hr: "HR",
      
      // Status
      available: "Available",
      away: "Away", 
      busy: "Busy",
      
      // Task Status
      todo: "Todo",
      inProgress: "In Progress",
      done: "Done",
      
      // Priority
      high: "High",
      medium: "Medium", 
      low: "Low",
      
      // Project Status
      active: "Active",
      completed: "Completed",
      onHold: "On Hold",
      
      // Time periods
      daily: "Daily",
      weekly: "Weekly", 
      monthly: "Monthly",
      custom: "Custom",
      
      // Statistics
      totalHours: "Total Hours",
      dailyAverage: "Daily Average", 
      topProject: "Top Project",
      mostProductive: "Most Productive",
      hourBankBalance: "Hour Bank Balance",
      thisWeek: "This Week",
      averagePerDay: "Average/Day",
      
      // Messages and Notifications
      success: "Success",
      error: "Error",
      taskCreated: "Task created successfully",
      taskUpdated: "Task updated successfully", 
      taskDeleted: "Task deleted successfully",
      noteCreated: "Note created successfully",
      noteUpdated: "Note updated successfully",
      noteDeleted: "Note deleted successfully",
      noteSentCalendar: "Note created and added to calendar",
      noteSentColleague: "Note created and sent to colleague",
      projectCreated: "Project created successfully",
      projectUpdated: "Project updated successfully", 
      projectDeleted: "Project deleted successfully",
      entryCreated: "Time entry created successfully",
      adjustmentCreated: "Hour adjustment created successfully",
      profileUpdated: "Profile updated successfully",
      settingsUpdated: "Settings updated successfully",
      
      // Empty States
      noTasksFound: "No tasks found",
      noProjectsFound: "No projects found",
      noNotesFound: "No notes found", 
      noTasksMatch: "No tasks match your filters.",
      createFirstTask: "Create your first task to get started.",
      createFirstProject: "Create your first project to get started.",
      createFirstNote: "Create your first note to get started.",
      
      // Validation and Errors
      fieldRequired: "This field is required",
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 8 characters",
      
      // Date and Time
      created: "Created",
      updated: "Updated",
      due: "Due",
      noDate: "No date",
      timeOptional: "Time (optional)",
      
      // Filters and Sorting
      allStatus: "All Status",
      filterByCategory: "Filter by category",
      
      // Help and FAQ
      help: "Help",
      faq: "Frequently Asked Questions",
      howToLogTime: "How do I log my time?",
      howToCreateTask: "How do I create a task?",
      howToViewReports: "How do I view reports?",
      
      // Profile and Account
      profile: "Profile",
      account: "Account",
      preferences: "Preferences",
      language: "Language",
      theme: "Theme",
      
      // Teams and Collaboration
      teamMembers: "Team Members",
      addMember: "Add Member",
      sendMessage: "Send Message",
      startConversation: "Start Conversation",
      
      // Game-related (if needed)
      score: "Score",
      round: "Round",
      yourTurn: "Your turn",
      waitingOpponent: "Waiting for opponent...",
      
      // Other common UI elements
      loading: "Loading...",
      retry: "Retry",
      refresh: "Refresh",
      more: "More",
      less: "Less",
      show: "Show",
      hide: "Hide",
      expand: "Expand",
      collapse: "Collapse",
      
      // Specific features
      reminder: "Reminder",
      enableReminder: "Enable Reminder",
      daysBefore: "Days Before",
      hoursBefore: "Hours Before",
      sendTo: "Send note to:",
      justSave: "Just Save",
      colleague: "Colleague",
      selectColleague: "Select Colleague",
      
      // Export and actions
      exportCsv: "Export CSV",
      download: "Download",
      viewDetails: "View Details",
      
      // Time tracking specific
      activeSession: "Active session",
      startSession: "Start Session",
      stopSession: "Stop Session",
      pauseSession: "Pause Session",
      resumeSession: "Resume Session",
      
      // Navigation specific
      previous: "Previous", 
      next: "Next",
      today: "Today",
      
      // 404 and errors
      pageNotFound: "Page not found",
      oopsPageNotFound: "Oops! Page not found",
      returnHome: "Return to Home"
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de bord",
      timesheets: "Feuilles de temps",
      tasks: "Tâches", 
      projects: "Projets",
      notes: "Notes",
      reports: "Rapports",
      team: "Équipe",
      settings: "Paramètres",
      calendar: "Calendrier",
      messages: "Messages",
      history: "Historique",
      
      // Page Titles and Descriptions
      dashboardWelcome: "Bon retour, {{name}} !",
      dashboardSubtitle: "Voici ce qui se passe avec votre suivi du temps aujourd'hui",
      
      calendarTitle: "Calendrier",
      calendarDescription: "Gérez vos tâches et votre emploi du temps",
      
      tasksTitle: "Tâches", 
      tasksDescription: "Organisez et suivez vos tâches",
      
      projectsTitle: "Projets",
      projectsDescription: "Gérez vos projets et suivez les progrès",
      
      notesTitle: "Notes",
      notesDescription: "Capturez vos pensées et idées",
      
      reportsTitle: "Rapports",
      reportsDescription: "Analysez vos données de suivi du temps",
      
      settingsTitle: "Paramètres",
      settingsDescription: "Gérez votre compte et vos préférences",
      
      teamTitle: "Équipe",
      teamDescription: "Connectez-vous avec vos coéquipiers et collaborez efficacement",
      
      timesheetsTitle: "Feuilles de temps",
      timesheetsDescription: "Suivez votre temps et gérez vos heures de travail",
      
      historyTitle: "Historique",
      historyDescription: "Suivez toutes vos actions et modifications",
      
      // Auth
      login: "Connexion",
      logout: "Déconnexion",
      signup: "Créer un compte", 
      signupSubtitle: "Rejoindre la plateforme D-Track",
      welcomeBack: "Bon retour",
      forgotPassword: "Mot de passe oublié",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Courriel",
      password: "Mot de passe",
      department: "Département",
      
      // Forms and Actions
      save: "Enregistrer",
      cancel: "Annuler", 
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      close: "Fermer",
      create: "Créer",
      update: "Mettre à jour",
      submit: "Soumettre",
      
      // Buttons and CTAs
      newTask: "Nouvelle tâche",
      newProject: "Nouveau projet",
      newNote: "Nouvelle note", 
      addEntry: "Ajouter une entrée",
      createTask: "Créer une tâche",
      createProject: "Créer un projet",
      createNote: "Créer une note",
      createNewTask: "Créer une nouvelle tâche",
      createNewProject: "Créer un nouveau projet",
      createNewNote: "Créer une nouvelle note",
      editTask: "Modifier la tâche",
      editNote: "Modifier la note",
      updateTask: "Mettre à jour la tâche",
      updateNote: "Mettre à jour la note", 
      saveChanges: "Enregistrer les modifications",
      startTracking: "Démarrer le suivi",
      
      // Form Labels
      title: "Titre",
      taskTitle: "Titre de la tâche",
      projectName: "Nom du projet",
      description: "Description",
      status: "Statut",
      priority: "Priorité",
      dueDate: "Date d'échéance",
      content: "Contenu",
      
      // Placeholders
      enterEmail: "Entrez votre courriel",
      enterPassword: "Entrez votre mot de passe",
      createPassword: "Créez un mot de passe",
      firstName_placeholder: "Prénom", 
      lastName_placeholder: "Nom",
      noteTitle: "Titre de la note...",
      noteContent: "Rédigez le contenu de votre note ici...",
      searchTasks: "Rechercher des tâches...",
      searchProjects: "Rechercher des projets...",
      searchNotes: "Rechercher des notes...",
      searchTeam: "Rechercher des membres de l'équipe...",
      searchTimeEntries: "Rechercher des entrées de temps...",
      searchConversations: "Rechercher des conversations...",
      typeMessage: "Tapez votre message...",
      workDescription: "Sur quoi avez-vous travaillé ?",
      selectProject: "Sélectionner un projet", 
      selectTask: "Sélectionner une tâche",
      selectDepartment: "Sélectionnez votre département",
      selectTime: "Sélectionner l'heure",
      pickDate: "Choisir une date",
      groupName: "Nom du groupe",
      
      // Departments
      marketing: "Marketing",
      it: "TI",
      support: "Support", 
      finance: "Finance",
      hr: "RH",
      
      // Status
      available: "Disponible",
      away: "Absent",
      busy: "Occupé",
      
      // Task Status
      todo: "À faire",
      inProgress: "En cours",
      done: "Terminé",
      
      // Priority
      high: "Élevée",
      medium: "Moyenne",
      low: "Faible",
      
      // Project Status
      active: "Actif",
      completed: "Terminé", 
      onHold: "En attente",
      
      // Time periods
      daily: "Quotidien",
      weekly: "Hebdomadaire",
      monthly: "Mensuel", 
      custom: "Personnalisé",
      
      // Statistics
      totalHours: "Heures totales",
      dailyAverage: "Moyenne quotidienne",
      topProject: "Projet principal",
      mostProductive: "Le plus productif",
      hourBankBalance: "Solde de la banque d'heures",
      thisWeek: "Cette semaine",
      averagePerDay: "Moyenne/Jour",
      
      // Messages and Notifications
      success: "Succès",
      error: "Erreur",
      taskCreated: "Tâche créée avec succès", 
      taskUpdated: "Tâche mise à jour avec succès",
      taskDeleted: "Tâche supprimée avec succès",
      noteCreated: "Note créée avec succès",
      noteUpdated: "Note mise à jour avec succès",
      noteDeleted: "Note supprimée avec succès",
      noteSentCalendar: "Note créée et ajoutée au calendrier",
      noteSentColleague: "Note créée et envoyée au collègue",
      projectCreated: "Projet créé avec succès",
      projectUpdated: "Projet mis à jour avec succès",
      projectDeleted: "Projet supprimé avec succès", 
      entryCreated: "Entrée de temps créée avec succès",
      adjustmentCreated: "Ajustement d'heures créé avec succès",
      profileUpdated: "Profil mis à jour avec succès",
      settingsUpdated: "Paramètres mis à jour avec succès",
      
      // Empty States
      noTasksFound: "Aucune tâche trouvée",
      noProjectsFound: "Aucun projet trouvé",
      noNotesFound: "Aucune note trouvée",
      noTasksMatch: "Aucune tâche ne correspond à vos filtres.",
      createFirstTask: "Créez votre première tâche pour commencer.", 
      createFirstProject: "Créez votre premier projet pour commencer.",
      createFirstNote: "Créez votre première note pour commencer.",
      
      // Validation and Errors
      fieldRequired: "Ce champ est obligatoire",
      invalidEmail: "Veuillez entrer une adresse courriel valide",
      passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
      
      // Date and Time
      created: "Créé",
      updated: "Mis à jour",
      due: "Échéance",
      noDate: "Aucune date",
      timeOptional: "Heure (optionnel)",
      
      // Filters and Sorting
      allStatus: "Tous les statuts", 
      filterByCategory: "Filtrer par catégorie",
      
      // Help and FAQ
      help: "Aide",
      faq: "Questions fréquemment posées",
      howToLogTime: "Comment enregistrer mon temps ?",
      howToCreateTask: "Comment créer une tâche ?",
      howToViewReports: "Comment voir les rapports ?",
      
      // Profile and Account
      profile: "Profil",
      account: "Compte",
      preferences: "Préférences",
      language: "Langue",
      theme: "Thème",
      
      // Teams and Collaboration
      teamMembers: "Membres de l'équipe", 
      addMember: "Ajouter un membre",
      sendMessage: "Envoyer un message",
      startConversation: "Démarrer une conversation",
      
      // Game-related (if needed)
      score: "Score",
      round: "Manche",
      yourTurn: "Votre tour",
      waitingOpponent: "En attente de l'adversaire...",
      
      // Other common UI elements
      loading: "Chargement...",
      retry: "Réessayer",
      refresh: "Actualiser", 
      more: "Plus",
      less: "Moins",
      show: "Afficher",
      hide: "Masquer",
      expand: "Développer",
      collapse: "Réduire",
      
      // Specific features
      reminder: "Rappel",
      enableReminder: "Activer le rappel",
      daysBefore: "Jours avant",
      hoursBefore: "Heures avant",
      sendTo: "Envoyer la note à :",
      justSave: "Seulement sauvegarder",
      colleague: "Collègue",
      selectColleague: "Sélectionner un collègue",
      
      // Export and actions
      exportCsv: "Exporter CSV", 
      download: "Télécharger",
      viewDetails: "Voir les détails",
      
      // Time tracking specific
      activeSession: "Session active",
      startSession: "Démarrer la session",
      stopSession: "Arrêter la session",
      pauseSession: "Mettre en pause la session",
      resumeSession: "Reprendre la session",
      
      // Navigation specific
      previous: "Précédent",
      next: "Suivant",
      today: "Aujourd'hui",
      
      // 404 and errors
      pageNotFound: "Page non trouvée", 
      oopsPageNotFound: "Oups ! Page non trouvée",
      returnHome: "Retour à l'accueil"
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  })

export default i18n