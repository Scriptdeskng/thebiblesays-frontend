'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button, Modal, Input, Badge } from '@/components/admin/ui';
import { mockShippingRegions, mockRoles, mockTeamMembers } from '@/services/mock.service';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'shipping' | 'roles' | 'team' | 'general'>('shipping');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-1">Settings</h1>
        <p className="text-sm text-grey">Configure shipping, roles, team members, and general settings</p>
      </div>

      <div className="bg-white rounded-xl border border-accent-2 overflow-hidden">
        <div className="flex border-b border-accent-2">
          {['shipping', 'roles', 'team', 'general'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-primary border-b-2 border-primary bg-accent-1/50' : 'text-grey hover:bg-accent-1'
              }`}
            >
              {tab === 'shipping' ? 'Shipping Fee' : tab === 'roles' ? 'Roles & Permission' : tab === 'team' ? 'Team Members' : 'General Settings'}
            </button>
          ))}
        </div>

        {activeTab === 'shipping' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Shipping Regions</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Region
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-1">
                  <tr>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Region</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Delivery Fee</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Timeline</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Status</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockShippingRegions.map((region) => (
                    <tr key={region.id} className="border-t border-accent-2">
                      <td className="px-4 py-3 font-medium text-primary">{region.region}</td>
                      <td className="px-4 py-3">₦{region.deliveryFee.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-grey">{region.timeline}</td>
                      <td className="px-4 py-3"><Badge variant={region.status === 'active' ? 'success' : 'default'}>{region.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-accent-1 rounded"><Edit size={14} className="text-grey" /></button>
                          <button className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Roles & Permissions</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Role
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-1">
                  <tr>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Role Name</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Members Assigned</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Permission Count</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Status</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRoles.map((role) => (
                    <tr key={role.id} className="border-t border-accent-2">
                      <td className="px-4 py-3 font-medium text-primary">{role.name}</td>
                      <td className="px-4 py-3">{role.membersAssigned}</td>
                      <td className="px-4 py-3">{role.permissionCount}</td>
                      <td className="px-4 py-3"><Badge variant={role.status === 'active' ? 'success' : 'default'}>{role.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-accent-1 rounded"><Edit size={14} className="text-grey" /></button>
                          <button className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Team Members</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add New Member
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-1">
                  <tr>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Name</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Email</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Role</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Last Active</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Status</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTeamMembers.map((member) => (
                    <tr key={member.id} className="border-t border-accent-2">
                      <td className="px-4 py-3 font-medium text-primary">{member.name}</td>
                      <td className="px-4 py-3 text-sm text-grey">{member.email}</td>
                      <td className="px-4 py-3">{member.role}</td>
                      <td className="px-4 py-3 text-sm text-grey">{member.lastActive}</td>
                      <td className="px-4 py-3"><Badge variant={member.status === 'active' ? 'success' : 'default'}>{member.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-accent-1 rounded"><Edit size={14} className="text-grey" /></button>
                          <button className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">App Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
                    <div>
                      <p className="font-medium text-primary">ChurchMerch Admin</p>
                      <p className="text-sm text-grey">Application Title</p>
                    </div>
                    <button className="p-2 hover:bg-accent-2 rounded-lg"><Edit size={16} className="text-grey" /></button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
                    <div>
                      <p className="font-medium text-primary">support@churchmerch.com</p>
                      <p className="text-sm text-grey">Support Email</p>
                    </div>
                    <button className="p-2 hover:bg-accent-2 rounded-lg"><Edit size={16} className="text-grey" /></button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
                    <div>
                      <p className="font-medium text-primary">+234 800 000 0000</p>
                      <p className="text-sm text-grey">Support Number</p>
                    </div>
                    <button className="p-2 hover:bg-accent-2 rounded-lg"><Edit size={16} className="text-grey" /></button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Notification Settings</h3>
                <div className="space-y-3">
                  {['Email Notifications', 'Push Notifications', 'SMS Alerts', 'Order Updates'].map((setting) => (
                    <div key={setting} className="flex items-center justify-between p-4 border border-accent-2 rounded-lg">
                      <p className="text-sm font-medium text-primary">{setting}</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-grey/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New">
        <div className="space-y-4">
          <Input label="Name" placeholder="Enter name" />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}