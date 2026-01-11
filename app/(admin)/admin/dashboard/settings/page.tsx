'use client';

import { useState } from 'react';
import { Search, Edit, Trash2, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button, Modal, Input, Badge } from '@/components/admin/ui';

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

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', lastActive: '2 hours ago', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', lastActive: '5 hours ago', status: 'active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Support', lastActive: '1 day ago', status: 'active' },
  ]);

  const [appInfo, setAppInfo] = useState({
    name: 'Faith Merch Store',
    email: 'contact@faithmerch.com',
    phone: '+234 801 234 5678',
    lastUpdated: '30 mins ago',
  });

  const [notifications, setNotifications] = useState({
    newUserRegistration: true,
    newOrder: true,
    failedTransaction: true,
    pendingSettlement: false,
    refundRequests: true,
    chargebacksDisputes: true,
  });

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
  });

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
      role: roles.length > 0 ? roles[0].name : '',
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
      setFormData({
        ...formData,
        name: item.name,
        email: item.email,
        role: item.role,
        status: item.status,
      });
    }

    setShowDetailsPage(true);
  };

  const handleSave = () => {
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
    } else if (activeTab === 'team') {
      if (isEditMode && selectedItem) {
        setTeamMembers(teamMembers.map(t =>
          t.id === selectedItem.id
            ? { ...t, name: formData.name, email: formData.email, role: formData.role, status: formData.status as any }
            : t
        ));
      } else {
        const newMember: TeamMember = {
          id: String(teamMembers.length + 1),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          lastActive: 'Just now',
          status: formData.status as any,
        };
        setTeamMembers([...teamMembers, newMember]);
      }
    }

    setShowDetailsPage(false);
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

  const handleToggleNotification = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
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
        <div className="bg-white rounded-xl p-6">
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
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
                <div>
                  <label className="block text-admin-primary font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none focus:border-[#A1CBFF]"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </>
            )}

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

            <div className="flex justify-center space-x-5 pt-5">
              <Button type="button" variant="secondary" onClick={() => setShowDetailsPage(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save Changes
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
                    {filteredTeam.map((member) => (
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
                    ))}
                  </tbody>
                </table>
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
                  <div className="space-y-3">
                    {[
                      { key: 'newUserRegistration', label: 'New user registration' },
                      { key: 'newOrder', label: 'New order' },
                      { key: 'failedTransaction', label: 'Failed transaction' },
                      { key: 'pendingSettlement', label: 'Pending settlement' },
                      { key: 'refundRequests', label: 'Refund requests' },
                      { key: 'chargebacksDisputes', label: 'Chargebacks/Disputes' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <span className="text-admin-primary">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => handleToggleNotification(item.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-grey/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-accent-2 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
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