'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { Button, Modal, Input, Badge, LoadingSpinner } from '@/components/admin/ui';
import { dashboardService } from '@/services/dashboard.service';
import { ApiNotificationSettings } from '@/types/admin.types';
import toast from 'react-hot-toast';

type SettingsTab = 'shipping' | 'roles' | 'team' | 'general';

interface ShippingRegion {
  id: string;
  region: string;
  deliveryFee: number;
  timeline: string;
  status: 'active' | 'expired' | 'deactivated';
}

interface Role {
  id: string;
  name: string;
  membersAssigned: number;
  permissionCount: number;
  permissions: string[];
  status: 'active' | 'deactivated';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'active' | 'deactivated';
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('shipping');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAppInfoModalOpen, setIsAppInfoModalOpen] = useState(false);

  const [shippingRegions, setShippingRegions] = useState<ShippingRegion[]>([
    { id: '1', region: 'Lagos', deliveryFee: 2500, timeline: '1 - 2 days', status: 'active' },
    { id: '2', region: 'Abuja', deliveryFee: 3500, timeline: '3 - 4 days', status: 'active' },
    { id: '3', region: 'Port Harcourt', deliveryFee: 4000, timeline: '3 - 4 days', status: 'active' },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Admin', membersAssigned: 3, permissionCount: 9, permissions: ['Dashboard', 'Products', 'Orders', 'Users', 'Finance', 'Custom Merch', 'Content Management', 'Loyalty Program', 'Settings'], status: 'active' },
    { id: '2', name: 'Manager', membersAssigned: 5, permissionCount: 6, permissions: ['Dashboard', 'Products', 'Orders', 'Users', 'Finance', 'Custom Merch'], status: 'active' },
    { id: '3', name: 'Support', membersAssigned: 8, permissionCount: 3, permissions: ['Dashboard', 'Orders', 'Users'], status: 'active' },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  const [appInfo, setAppInfo] = useState({
    name: 'Faith Merch Store',
    email: 'contact@faithmerch.com',
    phone: '+234 801 234 5678',
    lastUpdated: '30 mins ago',
  });

  const [notificationSettings, setNotificationSettings] = useState<ApiNotificationSettings | null>(null);
  const [notificationSettingsLoading, setNotificationSettingsLoading] = useState(false);
  const [updatingNotification, setUpdatingNotification] = useState(false);

  const [formData, setFormData] = useState({
    region: '',
    timeline: '1 - 2 days',
    deliveryFee: '',
    status: 'active',
    roleName: '',
    permissions: [] as string[],
    name: '',
    email: '',
    role: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const availablePermissions = [
    'Dashboard',
    'Products',
    'Orders',
    'Users',
    'Finance',
    'Custom Merch',
    'Content Management',
    'Loyalty Program',
    'Settings',
  ];

  const loadTeamMembers = useCallback(async () => {
    setTeamMembersLoading(true);
    try {
      const data = await dashboardService.getTeamMembers();
      // Transform API response to match TeamMember interface
      const transformedMembers: TeamMember[] = data.map((member: any) => {
        // Format name from first_name and last_name, fallback to email
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
        const name = fullName || member.email || 'Unknown';
        
        // Format last login date
        let lastActive = 'N/A';
        if (member.last_login) {
          const lastLoginDate = new Date(member.last_login);
          const now = new Date();
          const diffMs = now.getTime() - lastLoginDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          if (diffMins < 60) {
            lastActive = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
          } else if (diffHours < 24) {
            lastActive = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
          } else if (diffDays < 7) {
            lastActive = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
          } else {
            lastActive = lastLoginDate.toLocaleDateString();
          }
        }
        
        return {
          id: String(member.id || ''),
          name,
          email: member.email || '',
          role: member.role || '',
          lastActive,
          status: member.is_active ? 'active' : 'deactivated',
        };
      });
      setTeamMembers(transformedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setTeamMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamMembers();
    }
  }, [activeTab, loadTeamMembers]);

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setFormData({
      region: '',
      timeline: '1 - 2 days',
      deliveryFee: '',
      status: 'active',
      roleName: '',
      permissions: [],
      name: '',
      email: '',
      role: 'admin',
      first_name: '',
      last_name: '',
      password: '',
    });
    setShowDetailsPage(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditMode(true);

    if (activeTab === 'shipping') {
      setFormData({
        ...formData,
        region: item.region,
        timeline: item.timeline,
        deliveryFee: item.deliveryFee.toString(),
        status: item.status,
      });
    } else if (activeTab === 'roles') {
      setFormData({
        ...formData,
        roleName: item.name,
        permissions: item.permissions,
        status: item.status,
      });
    } else if (activeTab === 'team') {
      // Split name into first_name and last_name if it contains a space
      const nameParts = item.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        ...formData,
        name: item.name,
        email: item.email,
        role: item.role === 'Super Admin' ? 'superuser' : 'admin',
        status: item.status,
        first_name: firstName,
        last_name: lastName,
        password: '', // Don't populate password for edit
      });
    }

    setShowDetailsPage(true);
  };

  const handleSave = async () => {
    if (activeTab === 'shipping') {
      if (isEditMode && selectedItem) {
        setShippingRegions(shippingRegions.map(r =>
          r.id === selectedItem.id
            ? { ...r, region: formData.region, timeline: formData.timeline, deliveryFee: Number(formData.deliveryFee), status: formData.status as any }
            : r
        ));
      } else {
        const newRegion: ShippingRegion = {
          id: String(shippingRegions.length + 1),
          region: formData.region,
          timeline: formData.timeline,
          deliveryFee: Number(formData.deliveryFee),
          status: formData.status as any,
        };
        setShippingRegions([...shippingRegions, newRegion]);
      }
      setShowDetailsPage(false);
    } else if (activeTab === 'roles') {
      if (isEditMode && selectedItem) {
        setRoles(roles.map(r =>
          r.id === selectedItem.id
            ? { ...r, name: formData.roleName, permissions: formData.permissions, permissionCount: formData.permissions.length, status: formData.status as any }
            : r
        ));
      } else {
        const newRole: Role = {
          id: String(roles.length + 1),
          name: formData.roleName,
          membersAssigned: 0,
          permissionCount: formData.permissions.length,
          permissions: formData.permissions,
          status: formData.status as any,
        };
        setRoles([...roles, newRole]);
      }
      setShowDetailsPage(false);
    } else if (activeTab === 'team') {
      if (isEditMode && selectedItem) {
        // TODO: Implement update endpoint if available
        setTeamMembers(teamMembers.map(t =>
          t.id === selectedItem.id
            ? { ...t, name: formData.name, email: formData.email, role: formData.role, status: formData.status as any }
            : t
        ));
        setShowDetailsPage(false);
      } else {
        // Create new team member
        if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
          toast.error('Please fill in all required fields');
          return;
        }

        setIsSaving(true);
        try {
          await dashboardService.createTeamMember({
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role as 'admin' | 'superuser',
          });
          
          toast.success('Team member created successfully');
          setShowDetailsPage(false);
          // Reload team members
          await loadTeamMembers();
        } catch (error: any) {
          console.error('Error creating team member:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create team member';
          toast.error(errorMessage);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleTogglePermission = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission],
      });
    }
  };

  const loadNotificationSettings = async () => {
    setNotificationSettingsLoading(true);
    try {
      const data = await dashboardService.getNotificationSettings();
      setNotificationSettings(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load notification settings';
      toast.error(message);
    } finally {
      setNotificationSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'general') {
      loadNotificationSettings();
    }
  }, [activeTab]);

  const handleToggleNotification = async (key: keyof ApiNotificationSettings) => {
    if (!notificationSettings || updatingNotification) return;
    
    const newValue = !notificationSettings[key];
    setUpdatingNotification(true);
    
    try {
      await dashboardService.updateNotificationSettings(
        notificationSettings.id,
        { [key]: newValue }
      );
      toast.success('Notification setting updated');
      // Refetch notification settings after update
      await loadNotificationSettings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update notification setting';
      toast.error(message);
    } finally {
      setUpdatingNotification(false);
    }
  };

  const filteredShipping = shippingRegions.filter(r =>
    r.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeam = teamMembers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {showDetailsPage ? (
        <div className="bg-white rounded-xl">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={() => setShowDetailsPage(false)}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ChevronLeft size={20} />
              <h2 className="text-lg font-medium text-admin-primary">
                {isEditMode ? 'Edit' : 'Add'} {activeTab === 'shipping' ? 'Region' : activeTab === 'roles' ? 'Role' : 'Team Member'}
              </h2>
            </button>
          </div>

          <div className="space-y-6 p-6 bg-admin-primary/4">
            <div className="flex justify-end flex-1">
              {isEditMode && (
                <div className='flex items-center gap-1'>
                  <p className='text-admin-primary font-semibold'>Status:</p>
                  <Badge variant={formData.status === 'active' ? 'success' : 'danger'}>
                    {formData.status}
                  </Badge>
                </div>
              )}
            </div>
            {activeTab === 'shipping' && (
              <>
                <Input
                  label="Select Region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Enter region name"
                />
                <div>
                  <label className="block text-admin-primary font-medium mb-2">Timeline</label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none focus:border-[#A1CBFF]"
                  >
                    <option>1 - 2 days</option>
                    <option>3 - 4 days</option>
                    <option>7 days</option>
                    <option>2 weeks</option>
                  </select>
                </div>
                <Input
                  label="Delivery Fee"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                  placeholder="Enter delivery fee"
                />
              </>
            )}

            {activeTab === 'roles' && (
              <>
                <Input
                  label="Role Name"
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  placeholder="Enter role name"
                />
                <div>
                  <label className="block text-admin-primary font-medium mb-3">
                    Permission Count ({formData.permissions.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer p-3 border border-admin-primary/35 rounded-lg hover:bg-accent-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handleTogglePermission(permission)}
                          className="w-4 h-4 text-admin-primary focus:ring-admin-primary rounded"
                        />
                        <span className="text-sm text-admin-primary">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'team' && (
              <>
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
                {!isEditMode && (
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                )}
                <div>
                  <label className="block text-admin-primary font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none focus:border-[#A1CBFF]"
                    disabled={isEditMode}
                  >
                    <option value="admin">Admin</option>
                    <option value="superuser">Super Admin</option>
                  </select>
                </div>
              </>
            )}

            {(activeTab !== 'team' || isEditMode) && (
              <div>
                <label className="block text-admin-primary font-medium mb-3">Status</label>
                <div className="flex flex-wrap gap-3">
                  {activeTab === 'shipping' ? (
                    <>
                      {['expired', 'active', 'deactivated'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, status })}
                          className={`px-6 py-2 rounded-md border transition-all capitalize ${formData.status === status
                            ? 'border-[#A1CBFF] text-[#3291FF] bg-secondary'
                            : 'border-admin-primary/35 text-admin-primary'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['active', 'deactivated'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, status })}
                          className={`px-6 py-2 rounded-md border transition-all capitalize ${formData.status === status
                            ? 'border-[#A1CBFF] text-[#3291FF] bg-secondary'
                            : 'border-admin-primary/35 text-admin-primary'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-5 pt-5">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowDetailsPage(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='mb-6'>
            <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">Settings</h1>
            <p className="text-sm text-admin-primary">Manage your store settings and configurations</p>
          </div>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-wrap gap-2 bg-white p-1 w-fit">
              {[
                { key: 'shipping', label: 'Shipping Fee' },
                { key: 'roles', label: 'Roles & Permission' },
                { key: 'team', label: 'Team Members' },
                { key: 'general', label: 'General Settings' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as SettingsTab)}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${activeTab === tab.key
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab !== 'general' && (
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4'>
              <h2 className="text-lg font-semibold text-admin-primary">
                {activeTab === 'shipping' ? 'Shipping Regions' : activeTab === 'roles' ? 'Roles' : 'Team Members'}
              </h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={20} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
                  />
                </div>
                <Button onClick={handleAddNew}>
                  {activeTab === 'shipping' ? 'Add Region' : activeTab === 'roles' ? 'Create Role' : 'Add New Team'}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
            {activeTab === 'shipping' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent-1">
                    <tr>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Region</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Delivery Fee</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Timeline</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipping.map((region) => (
                      <tr
                        key={region.id}
                        onClick={() => handleEdit(region)}
                        className="border-b border-accent-2 transition-colors bg-white cursor-pointer hover:bg-accent-1/50"
                      >
                        <td className="px-6 py-4 text-admin-primary font-medium">{region.region}</td>
                        <td className="px-6 py-4 text-admin-primary">₦{region.deliveryFee.toLocaleString()}</td>
                        <td className="px-6 py-4 text-admin-primary">{region.timeline}</td>
                        <td className="px-6 py-4">
                          <Badge variant={region.status === 'active' ? 'success' : region.status === 'expired' ? 'warning' : 'danger'}>
                            {region.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent-1">
                    <tr>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Role Name</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Members Assigned</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Permission Count</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr
                        key={role.id}
                        onClick={() => handleEdit(role)}
                        className="border-b border-accent-2 transition-colors bg-white cursor-pointer hover:bg-accent-1/50"
                      >
                        <td className="px-6 py-4 text-admin-primary font-medium">{role.name}</td>
                        <td className="px-6 py-4 text-admin-primary">{role.membersAssigned}</td>
                        <td className="px-6 py-4 text-admin-primary">{role.permissionCount}</td>
                        <td className="px-6 py-4">
                          <Badge variant={role.status === 'active' ? 'success' : 'danger'}>
                            {role.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="overflow-x-auto">
                {teamMembersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-accent-1">
                      <tr>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Name</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Email</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Role</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Last Active</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-grey">
                            No team members found
                          </td>
                        </tr>
                      ) : (
                        filteredTeam.map((member) => (
                          <tr
                            key={member.id}
                            onClick={() => handleEdit(member)}
                            className="border-b border-accent-2 transition-colors bg-white cursor-pointer hover:bg-accent-1/50"
                          >
                            <td className="px-6 py-4 text-admin-primary font-medium">{member.name}</td>
                            <td className="px-6 py-4 text-admin-primary">{member.email}</td>
                            <td className="px-6 py-4 text-admin-primary">{member.role}</td>
                            <td className="px-6 py-4 text-grey">{member.lastActive}</td>
                            <td className="px-6 py-4">
                              <Badge variant={member.status === 'active' ? 'success' : 'danger'}>
                                {member.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'general' && (
              <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg p-6 border border-accent-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-admin-primary mb-1">App Information</h3>
                      <p className="text-sm text-grey">Manage your application details</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsAppInfoModalOpen(true)}
                        className="p-2 hover:bg-accent-1 rounded-lg"
                      >
                        <Edit size={16} className="text-admin-primary" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-grey">App Name:</span>
                      <span className="text-admin-primary font-medium">{appInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey">Email:</span>
                      <span className="text-admin-primary font-medium">{appInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey">Phone Number:</span>
                      <span className="text-admin-primary font-medium">{appInfo.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey">Last Updated:</span>
                      <span className="text-admin-primary">{appInfo.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-accent-2">
                  <h3 className="font-semibold text-admin-primary mb-4">Notification Settings</h3>
                  {notificationSettingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : !notificationSettings ? (
                    <p className="text-grey text-center py-4">Failed to load notification settings</p>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { key: 'is_enabled' as keyof ApiNotificationSettings, label: 'Enable All Notifications' },
                        { key: 'enable_order_notifications' as keyof ApiNotificationSettings, label: 'Order Notifications' },
                        { key: 'enable_custom_merch_notifications' as keyof ApiNotificationSettings, label: 'Custom Merch Notifications' },
                        { key: 'enable_stock_notifications' as keyof ApiNotificationSettings, label: 'Stock Notifications' },
                        { key: 'enable_revenue_notifications' as keyof ApiNotificationSettings, label: 'Revenue Notifications' },
                        { key: 'enable_testimonial_notifications' as keyof ApiNotificationSettings, label: 'Testimonial Notifications' },
                        { key: 'enable_payment_notifications' as keyof ApiNotificationSettings, label: 'Payment Notifications' },
                        { key: 'enable_user_notifications' as keyof ApiNotificationSettings, label: 'User Notifications' },
                        { key: 'auto_cleanup_enabled' as keyof ApiNotificationSettings, label: 'Auto Cleanup Notifications' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <span className="text-admin-primary">{item.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key] as boolean}
                              onChange={() => handleToggleNotification(item.key)}
                              disabled={updatingNotification}
                              className="sr-only peer"
                            />
                            <div className="w-11 cursor-pointer h-6 bg-grey/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-accent-2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Modal
            isOpen={isAppInfoModalOpen}
            onClose={() => setIsAppInfoModalOpen(false)}
            title="Edit App Information"
            size="md"
          >
            <div className="space-y-4">
              <Input
                label="App Name"
                value={appInfo.name}
                onChange={(e) => setAppInfo({ ...appInfo, name: e.target.value })}
                placeholder="Enter app name"
              />
              <Input
                label="Email"
                type="email"
                value={appInfo.email}
                onChange={(e) => setAppInfo({ ...appInfo, email: e.target.value })}
                placeholder="Enter email"
              />
              <Input
                label="Phone Number"
                value={appInfo.phone}
                onChange={(e) => setAppInfo({ ...appInfo, phone: e.target.value })}
                placeholder="Enter phone number"
              />

              <div className="flex justify-center space-x-5 pt-5">
                <Button type="button" variant="secondary" onClick={() => setIsAppInfoModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setIsAppInfoModalOpen(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}