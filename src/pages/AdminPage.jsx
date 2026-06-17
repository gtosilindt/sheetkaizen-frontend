import { useState, useEffect } from 'react'
import api from '../services/api'
import { Users, Building, Plus } from 'lucide-react'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [reparti, setReparti] = useState([])
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    loadUsers()
    loadReparti()
  }, [])

  const loadUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data) }
    catch (err) { console.error(err) }
  }

  const loadReparti = async () => {
    try { const res = await api.get('/reparti'); setReparti(res.data) }
    catch (err) { console.error(err) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Amministrazione</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          <Users size={18} /> Utenti
        </button>
        <button onClick={() => setActiveTab('reparti')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'reparti' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          <Building size={18} /> Reparti
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="p-4">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Ruolo</th>
                <th className="p-4">Reparto</th>
                <th className="p-4">Stato</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="p-4 font-medium">{u.full_name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-4">{u.reparto}</td>
                  <td className="p-4">{u.is_active ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reparti' && (
        <div className="bg-white rounded-xl shadow p-6">
          {reparti.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nessun reparto configurato</p>
          ) : (
            reparti.map(r => (
              <div key={r._id} className="border-b last:border-0 py-3">
                <h3 className="font-bold">{r.nome}</h3>
                <div className="flex gap-2 mt-1">
                  {r.linee?.map((l, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{l.nome}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
