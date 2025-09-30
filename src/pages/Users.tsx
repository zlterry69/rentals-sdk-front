import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/app/api';
import CreateUserModal from '@/components/modals/CreateUserModal';
import ViewUserModal from '@/components/modals/ViewUserModal';
import EditUserModal from '@/components/modals/EditUserModal';

interface User {
  id: string;
  public_id: string;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  is_active: boolean;
  is_verified: boolean;
  profile_image?: string;
  created_at: string;
  last_login: string | null;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  users: number;
  admins: number;
  superadmins: number;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    users: 0,
    admins: 0,
    superadmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Permisos basados en rol
  const canEdit = (targetUser: User) => {
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin') {
      return targetUser.role === 'user'; // Admin solo puede editar users
    }
    return false;
  };

  const canDelete = (targetUser: User) => {
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin') {
      return targetUser.role === 'user'; // Admin solo puede eliminar users
    }
    return false;
  };

  const canChangeRole = (targetUser: User) => {
    if (currentUser?.role === 'superadmin') return true;
    if (currentUser?.role === 'admin') {
      return targetUser.role === 'user'; // Admin puede promover users a admin
    }
    return false;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/users');
      setUsers(response.data.users);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, {
        is_active: !currentStatus
      });
      toast.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error al actualizar estado del usuario');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, {
        role: newRole
      });
      toast.success('Rol actualizado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol del usuario');
    }
  };

  const confirmDeleteUser = (user: User) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar a "${user.full_name || user.email}"?\n\nEsta acción no se puede deshacer y eliminará:\n- Todos los datos del usuario\n- Sus propiedades asociadas\n- Imágenes en S3\n- Referencias en la base de datos`;
    
    if (confirm(confirmMessage)) {
      deleteUser(user.id);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const editUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <ShieldExclamationIcon className="h-4 w-4" />;
      case 'admin': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'user': return <UserPlusIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlusIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.active}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Inactivos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.inactive}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlusIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Usuarios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.users}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Admins
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.admins}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldExclamationIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    SuperAdmins
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.superadmins}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buscar usuarios
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, email o username..."
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por rol
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">Todos los roles</option>
              <option value="user">Usuarios</option>
              <option value="admin">Administradores</option>
              <option value="superadmin">Super Administradores</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt={user.full_name || user.email}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name 
                                ? user.full_name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()
                                : user.email[0].toUpperCase()
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {canEdit(user) && (
                      <button
                        onClick={() => editUser(user)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Editar usuario"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}

                    {canChangeRole(user) && (
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className="text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        title="Cambiar rol"
                      >
                        <option value="user">User</option>
                        {currentUser?.role === 'superadmin' && (
                          <>
                            <option value="admin">Admin</option>
                            <option value="superadmin">SuperAdmin</option>
                          </>
                        )}
                      </select>
                    )}

                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`${
                        user.is_active 
                          ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                      title={user.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {user.is_active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                    </button>

                    {canDelete(user) && (
                      <button
                        onClick={() => confirmDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Eliminar usuario"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay usuarios
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron usuarios con los filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateUser={fetchUsers}
        isCreating={loading}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={fetchUsers}
        user={selectedUser}
        currentUserRole={currentUser?.role || 'user'}
      />
    </div>
  );
};

export default Users;
