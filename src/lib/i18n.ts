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
      
      // Auth
      login: "Login",
      logout: "Logout",
      signup: "Create Account",
      forgotPassword: "Forgot Password",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      department: "Department",
      
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
      
      // Timesheets
      addEntry: "Add Entry",
      date: "Date",
      category: "Category",
      task: "Task",
      hours: "Hours",
      exportCsv: "Export CSV",
      weeklyView: "Weekly View",
      
      // Categories
      project: "Project",
      meeting: "Meeting",
      training: "Training",
      other: "Other",
      
      // Tasks
      toDo: "To Do",
      inProgress: "In Progress",
      done: "Done",
      
      // General
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      close: "Close",
      finished: "Finished",
      unfinished: "Unfinished",
      total: "Total",
      weekly: "Weekly",
      monthly: "Monthly",
      
      // Help
      help: "Help",
      faq: "Frequently Asked Questions",
      howToLogTime: "How do I log my time?",
      howToCreateTask: "How do I create a task?",
      howToViewReports: "How do I view reports?",
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
      
      // Auth
      login: "Connexion",
      logout: "Déconnexion",
      signup: "Créer un compte",
      forgotPassword: "Mot de passe oublié",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Courriel",
      password: "Mot de passe",
      department: "Département",
      
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
      
      // Timesheets
      addEntry: "Ajouter une entrée",
      date: "Date",
      category: "Catégorie",
      task: "Tâche",
      hours: "Heures",
      exportCsv: "Exporter CSV",
      weeklyView: "Vue hebdomadaire",
      
      // Categories
      project: "Projet",
      meeting: "Réunion",
      training: "Formation",
      other: "Autre",
      
      // Tasks
      toDo: "À faire",
      inProgress: "En cours",
      done: "Terminé",
      
      // General
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      close: "Fermer",
      finished: "Terminé",
      unfinished: "Non terminé",
      total: "Total",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      
      // Help
      help: "Aide",
      faq: "Questions fréquemment posées",
      howToLogTime: "Comment enregistrer mon temps?",
      howToCreateTask: "Comment créer une tâche?",
      howToViewReports: "Comment voir les rapports?",
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