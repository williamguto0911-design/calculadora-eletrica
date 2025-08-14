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

export async function signUpUser(email, password, details) {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
        alert('Erro ao registrar: ' + authError.message);
        return { error: authError };
    }
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update(details)
            .eq('id', authData.user.id);

        if (profileError) {
            alert('Erro ao salvar dados do perfil: ' + profileError.message);
            return { error: profileError };
        }
    }
    return { error: null };
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