import { supabase } from './supabaseClient.js';

// --- FUNÇÕES DE PROJETO ---
export async function fetchProjects(searchTerm) {
    let query = supabase.from('projects').select('id, project_name, owner_id, profiles(nome)');
    if (searchTerm) {
        query = query.ilike('project_name', `%${searchTerm}%`);
    }
    const { data, error } = await query.order('project_name');
    if (error) console.error('Erro ao buscar projetos:', error.message);
    return data || [];
}

export async function fetchProjectById(projectId) {
    const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (error) console.error('Erro ao buscar projeto por ID:', error.message);
    return data;
}

export async function saveProject(projectData, projectId) {
    let result;
    if (projectId) {
        result = await supabase.from('projects').update(projectData).eq('id', projectId).select().single();
    } else {
        if (!projectData.main_data.codigoCliente) {
            const { count, error } = await supabase.from('projects').select('*', { count: 'exact', head: true });
            if (error) { throw new Error("Erro ao gerar código do cliente"); }
            projectData.main_data.codigoCliente = 'C-' + String((count || 0) + 1).padStart(3, '0');
        }
        result = await supabase.from('projects').insert(projectData).select().single();
    }
    return result;
}

export async function deleteProject(projectId) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    return { error };
}

// --- FUNÇÕES DE USUÁRIO (ADMIN) ---
export async function fetchAllUsers() {
    const { data, error } = await supabase.from('profiles').select('*').order('nome');
    if (error) console.error('Erro ao buscar usuários:', error.message);
    return data || [];
}

export async function approveUser(userId) {
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    return { error };
}

export async function updateUserProfile(userId, profileData) {
    const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);
    return { error };
}

export async function fetchAllApprovedUsers() {
    const { data, error } = await supabase.from('profiles').select('id, nome').eq('is_approved', true);
    if (error) console.error('Erro ao buscar usuários aprovados:', error.message);
    return data || [];
}

export async function transferProjectOwner(projectId, newOwnerId) {
    const { error } = await supabase.from('projects').update({ owner_id: newOwnerId }).eq('id', projectId);
    return { error };
}