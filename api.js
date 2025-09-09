// Arquivo: api.js

import { supabase } from './supabaseClient.js';

// --- FUNÇÕES DE PROJETO ---

export async function fetchProjects(searchTerm) {
    let query = supabase.from('projects').select('id, project_name, owner_id, profile:profiles(nome)');
    if (searchTerm) {
        query = query.ilike('project_name', `%${searchTerm}%`);
    }
    const { data, error } = await query.order('project_name');
    if (error) {
        console.error('Erro ao buscar projetos:', error.message);
        alert("Erro ao carregar os projetos: " + error.message);
    }
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
        result = await supabase.from('projects').insert(projectData).select().single();
    }
    return result;
}

export async function deleteProject(projectId) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    return { error };
}

// --- FUNÇÕES DE ADMINISTRAÇÃO ---

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

/**
 * NOVA FUNÇÃO
 * Busca todos os dados técnicos do Supabase de uma só vez.
 */
export async function fetchTechnicalData() {
    try {
        const [
            disjuntoresRes,
            cabosRes,
            eletrodutosRes,
            k1Res,
            k2Res,
            k3Res
        ] = await Promise.all([
            supabase.from('disjuntores').select('*'),
            supabase.from('cabos').select('*'),
            supabase.from('eletrodutos').select('*'),
            supabase.from('fatores_k1_temperatura').select('*'),
            supabase.from('fatores_k2_solo').select('*'),
            supabase.from('fatores_k3_agrupamento').select('*')
        ]);

        // Verifica se houve erro em alguma das consultas
        const errors = [disjuntoresRes, cabosRes, eletrodutosRes, k1Res, k2Res, k3Res].map(res => res.error).filter(Boolean);
        if (errors.length > 0) {
            throw new Error('Falha ao buscar dados técnicos: ' + errors.map(e => e.message).join(', '));
        }

        return {
            disjuntores: disjuntoresRes.data,
            cabos: cabosRes.data,
            eletrodutos: eletrodutosRes.data,
            fatores_k1: k1Res.data,
            fatores_k2: k2Res.data,
            fatores_k3: k3Res.data,
        };
    } catch (error) {
        console.error(error.message);
        alert(error.message);
        return null;
    }
}