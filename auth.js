// Arquivo: auth.js

import { supabase } from './supabaseClient.js';

export async function signInUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Erro no login: ' + error.message);
        return { user: null, profile: null };
    }
    if (data.user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        if (profileError) {
            alert('Erro ao buscar perfil: ' + profileError.message);
            return { user: data.user, profile: null };
        }
        return { user: data.user, profile };
    }
    return { user: null, profile: null };
}

// FUNÇÃO CORRIGIDA
export async function signUpUser(email, password, details) {
    // Agora, os 'details' (nome, cpf, etc.) são enviados DENTRO da função de cadastro
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: details
        }
    });

    if (error) {
        alert('Erro ao registrar: ' + error.message);
    }

    // A etapa de 'update' foi removida pois não é mais necessária.
    return { error };
}

export async function signOutUser() {
    await supabase.auth.signOut();
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        return null;
    }
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    return profile;
}