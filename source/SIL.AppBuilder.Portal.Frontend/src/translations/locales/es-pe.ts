export default {
  appName: 'Scriptoria',
  welcome: 'Bienvenidos a Scriptoria',
  search: 'Buscar',

  contactUs: 'Contáctanos',
  exampleForm: 'Formulario de ejemplo',

  updated: 'Actualizado!',

  common: {
    search: 'Buscar',
    change: 'Cambiar',
    save: 'Guardar'
  },

  auth: {
    title: 'Scriptoria',
    signup: 'Registrarse',
    login: 'Ingresar',
  },

  directory: {
    title: `Directorio de proyectos ({numProjects})`,
    filters: {
      dateRange: 'Rango de Fechas'
    }
  },

  header: {
    myProfile: 'Mi perfil',
    help: 'Ayuda',
    signOut: 'Salir',
    clearAll: 'Eliminar todas',
    emptyNotifications: 'No tienes nuevas notificaciones.'
  },

  sidebar: {
    myTasks: 'Mis tareas',
    myProjects: 'Mis Proyectos',
    organizationProjects: 'Proyectos de Organización',
    users: 'Usuarios',
    organizationSettings: 'Configuración de organización',
    projectDirectory: 'Directorio de proyectos',
    addProject: 'Agregar proyectos'
  },

  invitations: {
    orgPrompt: '¿Te gustaría registrar a tu organización?',
    missingTokenTitle: 'El token de invitación no existe',
    missingTokenPrompt: 'Por favor revisa el link y prueba otra vez',
    orgInviteTitle: 'Has sido invitado a crear una organización!',
    orgName: 'Nombre de Organización',
    orgUrl: 'URL del website de Organización',
    orgSubmit: 'Agregar Organización',
  },

  org: {
    allOrganizations: 'Todas las organizaciones',
    createSuccess: 'Organización creada exitosamente!',
    settingsTitle: 'Configuración de Organización',
    selectLogo: 'Selecciona un logo',
    productsTitle: 'Productos y publicaciones',
    makePrivateTitle: 'Hacer privado al proyecto por defecto',
    makePrivateDescription: `
      Cuando un proyecto es creado, por defecto es privado.
      (Los proyectos privados no pueden ser visto por nadie fuera de tu organización)`,
    productSelectTitle: 'Selecciona todos los productos que quisieras estén disponibles para tu organización',
    navBasic: 'Información Básica',
    navProducts: 'Productos',
    navGroups: 'Grupos',
    navInfrastructure: 'Infrastructura',
    infrastructureTitle: 'Infrastructura',
    useSilInfrastructureTitle: `Usa la infraestructura de construcción SIL International - AWS`,
    groupsTitle: 'Grupos',
    noGroups: 'Tu organización no tiene grupos',
    addGroupButton: 'Agrega un grupo',
    basicTitle: 'Información básica',
    orgName: 'Nombre de Organización',
    save: 'Guardar',
  },

  products: {
  },

  profile: {
    title: 'Perfil',
    pictureTitle: 'Imagen de Perfil',
    general: 'General',
    generalInformation: 'Información general',
    updated: 'Usuario actualizado correctamente!',
    updatePicture: 'Actualiza tu image en Gravatar.com',
    uploadPicture: 'Carga una nueva figura',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    location: 'Localidad',
    locale: 'Idioma',
    timezone: 'Zona horaria',
    timezonePlaceholder: 'Selecciona tu zona horaria...',
    notificationSettingsTitle: 'Configuración de Notificaciones',
    optOutOfEmailOption: 'Deseo recibir notificaciones por correo electrónico',
    sshSettingsTitle: 'Administra tus llaves personales SSH',
    sshKeyLabel: 'Llave SSH Key',
    visibleProfile: 'Visibilidad del Perfil',
    noPhone: 'Sin teléfono',
    noTimezone: 'Usando el tiempo del servidor GMT-0',
    visibility: {
      visible: 'La información de mi perfil es pública',
      restricted: 'La información de mi está restringida del público'
    }
  },

  errors: {
    notFoundTitle: 'No encontrado!',
    notFoundDescription: 'Algo salió mal y no pudimos encontrar esta página o recursos!',
    userForbidden: 'Ocurrió un error: Prohibido. Contácte con su administrador'
  },

  tasks: {
    title: 'Mis tareas',
    project: 'Proyecto',
    product: 'Producto',
    assignedTo: 'Asignado a',
    status: 'Estado',
    waitTime: 'Tiempo de espera',
    unclaimed: '[sin asignar]',
    noTasksTitle: 'No hay tareas asignadas para ti.',
    noTasksDescription: 'Las tareas que requieren tu atención aparecerán aqui.',
    reassign: 'Asignar',
  },

  projects: {
    switcher: {
      myProjects: `Mis Proyectos ({numProjects})`,
      archived: `Archivados ({numProjects})`,
      dropdown: {
        orgProjects: 'Projectos de organización',
        myProjects: 'Mis Projectos',
        archived: 'Proyectos archivados'
      }
    },
    noneFound: 'No projects matching the selected criteria were found.',
    table: {
      columns: {

      }
    }
  },

  project: {
    createdOn: 'Creado',
    overview: 'Información',
    dropdown: {
      transfer: 'Transferir propiedad',
      archive: 'Archivar',
      reactivate: 'Reactivar'
    },
    details: {
      title: 'Detalles',
      language: 'Lenguajes',
      type: 'Tipo de Projecto'
    },
    products: {
      title: 'Productos',
      empty: 'No tiene productos para este projecto.',
      add: 'agregar producto'
    },
    settings: {
      title: 'Configuración',
      automaticRebuild: {
        title: 'Construcción automática',
        description: 'Cuando esté activo, Scriptoria reconstruirá automáticamente tus productos cuando el código fuente se actualice.'
      },
      organizationDownloads: {
        title: 'Permitir decargas',
        description: 'Cuando está activo, cualquier usuario de Scriptoria que encuentre el proyecto podrá descargarlo junto con sus artefactos'
      }
    },
    side: {
      repositoryLocation: 'Link al Repositorio',
      organization: 'Organización',
      projectOwner: 'Dueño del projecto',
      projectGroup: 'Grupo del projecto',
      reviewers: {
        title: 'Revisores',
        add: 'Agregar revisor'
      }
    },
    operations: {
      archive: {
        success: 'Proyecto archivado',
        error: 'Ocurrió un error al tratar de archivar un proyecto'
      }
    }
  },

  users: {
    title: 'Manage Users',
    table: {
      columns: {
        name: 'Nombre',
        role: 'Rol',
        groups: 'Grupo',
        active: 'Activo'
      }
    },
    operations: {
      lock: {
        success: 'Usuario inactivo',
        error: 'Hubo un error al desactivar al usuario'
      },
      unlock: {
        success: 'Usuario activo',
        error: 'Hubo un error al activar al usuario'
      }
    }
  }

};
