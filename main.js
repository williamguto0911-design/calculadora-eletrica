// Arquivo: main.js

import * as auth from './auth.js';
import * as ui from './ui.js';
import * as api from './api.js';
import * as utils from './utils.js';
import { supabase } from './supabaseClient.js'; // Importamos o supabase aqui

// --- ESTADO DA APLICAÇÃO ---
let currentUserProfile = null;

// --- INICIALIZAÇÃO E VERIFICAÇÃO DE SESSÃO ---
function main() {
    setupEventListeners();
    utils.atualizarMascaraDocumento();
}

// --- CONFIGURAÇÃO DOS EVENTOS ---
function setupEventListeners() {
    // Autenticação
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('registerBtn').addEventListener('click', () => ui.openModal('registerModalOverlay'));
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Redefinição de Senha
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        ui.openModal('forgotPasswordModalOverlay');
    });
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
    document.getElementById('resetPasswordForm').addEventListener('submit', handleResetPassword);

    // Modais
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => ui.closeModal(e.target.dataset.modalId));
    });

    // Ações de Projeto
    document.getElementById('saveBtn').addEventListener('click', handleSaveProject);
    document.getElementById('loadBtn').addEventListener('click', handleLoadProject);
    document.getElementById('deleteBtn').addEventListener('click', handleDeleteProject);
    document.getElementById('newBtn').addEventListener('click', handleNewProject);
    document.getElementById('searchInput').addEventListener('input', (e) => handleSearch(e.target.value));

    // Ações de Circuito
    document.getElementById('addCircuitBtn').addEventListener('click', ui.addCircuit);
    document.getElementById('circuits-container').addEventListener('click', e => {
        if (e.target.classList.contains('remove-btn')) {
            ui.removeCircuit(e.target.dataset.circuitId);
        }
    });

    // Cálculos e PDF
    document.getElementById('calculateBtn').addEventListener('click', handleCalculate);
    document.getElementById('pdfBtn').addEventListener('click', handleGeneratePdf);
    
    // Máscaras
    document.getElementById('regCpf').addEventListener('input', utils.mascaraCPF);
    document.getElementById('regTelefone').addEventListener('input', utils.mascaraCelular);
    document.getElementById('editCpf').addEventListener('input', utils.mascaraCPF);
    document.getElementById('editTelefone').addEventListener('input', utils.mascaraCelular);
    document.getElementById('tipoDocumento').addEventListener('change', utils.atualizarMascaraDocumento);
    document.getElementById('documento').addEventListener('input', utils.aplicarMascara);
    document.getElementById('telefone').addEventListener('input', utils.mascaraTelefone);
    document.getElementById('celular').addEventListener('input', utils.mascaraCelular);

    // Admin
    document.getElementById('adminPanelBtn').addEventListener('click', showAdminPanel);
    document.getElementById('manageProjectsBtn').addEventListener('click', showManageProjectsPanel);
    document.getElementById('adminUserList').addEventListener('click', handleAdminUserActions);
    document.getElementById('editUserForm').addEventListener('submit', handleUpdateUser);
    document.getElementById('adminProjectsTableBody').addEventListener('click', handleAdminProjectActions);
}

// --- HANDLERS (FUNÇÕES DE EVENTO) ---

async function handleLogin() {
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('password').value;
    // A lógica de login agora é gerenciada pelo onAuthStateChange, então aqui só tentamos o login.
    await auth.signInUser(email, password);
}

async function handleLogout() {
    await auth.signOutUser();
}

async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const details = {
        nome: document.getElementById('regNome').value,
        cpf: document.getElementById('regCpf').value,
        telefone: document.getElementById('regTelefone').value,
        crea: document.getElementById('regCrea').value,
        email: email
    };
    const { error } = await auth.signUpUser(email, password, details);
    if (!error) {
        alert('Cadastro realizado com sucesso! Aguarde a aprovação de um administrador.');
        ui.closeModal('registerModalOverlay');
        event.target.reset();
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    const { error } = await auth.sendPasswordResetEmail(email);
    if (error) {
        alert("Erro ao enviar e-mail: " + error.message);
    } else {
        alert("Se o e-mail estiver cadastrado, um link de redefinição foi enviado!");
        ui.closeModal('forgotPasswordModalOverlay');
        event.target.reset();
    }
}

async function handleResetPassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const { error } = await auth.updatePassword(newPassword);

    if (error) {
        alert("Erro ao atualizar senha: " + error.message);
    } else {
        alert("Senha atualizada com sucesso! Por favor, faça o login com sua nova senha.");
        window.location.hash = ''; // Limpa o hash da URL
        ui.showLoginView();
        document.getElementById('resetPasswordContainer').style.display = 'none';
    }
}

async function handleSaveProject() {
    const projectName = document.getElementById('obra').value.trim();
    if (!projectName) {
        alert("Por favor, insira um 'Nome da Obra' para salvar.");
        return;
    }
    const mainData = {};
    document.querySelectorAll('#main-form input, #main-form select').forEach(el => mainData[el.id] = el.value);
    const techData = {};
    document.querySelectorAll('#tech-form input').forEach(el => techData[el.id] = el.value);
    const circuitsData = [];
    document.querySelectorAll('.circuit-block').forEach(block => {
        const circuit = { id: block.dataset.id };
        block.querySelectorAll('input, select').forEach(el => {
            circuit[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        circuitsData.push(circuit);
    });
    const projectData = {
        project_name: projectName,
        main_data: mainData,
        tech_data: techData,
        circuits_data: circuitsData,
        owner_id: currentUserProfile.id
    };
    const currentProjectId = document.getElementById('currentProjectId').value;
    try {
        const { data, error } = await api.saveProject(projectData, currentProjectId);
        if (error) throw error;
        alert(`Obra "${projectName}" salva com sucesso!`);
        document.getElementById('currentProjectId').value = data.id;
        document.getElementById('codigoCliente').value = data.main_data.codigoCliente;
        await handleSearch();
    } catch (error) {
        alert('Erro ao salvar obra: ' + error.message);
    }
}

async function handleLoadProject() {
    const projectId = document.getElementById('savedProjectsSelect').value;
    if (!projectId) return;
    const project = await api.fetchProjectById(projectId);
    if (project) {
        ui.populateFormWithProjectData(project);
        alert(`Obra "${project.project_name}" carregada.`);
    }
}

async function handleDeleteProject() {
    const projectId = document.getElementById('savedProjectsSelect').value;
    const projectName = document.getElementById('savedProjectsSelect').options[document.getElementById('savedProjectsSelect').selectedIndex].text;
    if (!projectId || !confirm(`Tem certeza que deseja excluir a obra "${projectName}"?`)) return;
    const { error } = await api.deleteProject(projectId);
    if (error) {
        alert('Erro ao excluir obra: ' + error.message);
    } else {
        alert("Obra excluída.");
        ui.resetForm(true);
        await handleSearch();
    }
}

function handleNewProject() {
    if (confirm("Deseja limpar todos os campos para iniciar uma nova obra?")) {
        ui.resetForm(true);
    }
}

async function handleSearch(term = '') {
    const projects = await api.fetchProjects(term);
    ui.populateProjectList(projects, currentUserProfile.is_admin);
}

function handleCalculate() {
    const results = utils.calcularTodosCircuitos();
    if (results) {
        ui.renderReport(results);
    }
}

function handleGeneratePdf() {
    const results = utils.calcularTodosCircuitos();
    if(results) {
        ui.generatePdf(results, currentUserProfile);
    }
}

async function showAdminPanel() {
    const users = await api.fetchAllUsers();
    ui.populateUsersPanel(users);
    ui.openModal('adminPanelModalOverlay');
}

async function showManageProjectsPanel() {
    const projects = await api.fetchProjects();
    const users = await api.fetchAllApprovedUsers();
    ui.populateProjectsPanel_Admin(projects, users);
    ui.openModal('manageProjectsModalOverlay');
}

async function handleAdminUserActions(event) {
    const target = event.target;
    const userId = target.dataset.userId;
    if (target.classList.contains('approve-user-btn')) {
        await api.approveUser(userId);
        showAdminPanel();
    }
    if (target.classList.contains('edit-user-btn')) {
        const users = await api.fetchAllUsers();
        const user = users.find(u => u.id === userId);
        if (user) ui.populateEditUserModal(user);
    }
    if (target.classList.contains('remove-user-btn')) {
        alert("A remoção completa de usuários (auth) deve ser feita no painel do Supabase. Esta ação não é suportada diretamente via API por segurança.");
    }
}

async function handleUpdateUser(event) {
    event.preventDefault();
    const userId = document.getElementById('editUserId').value;
    const data = {
        nome: document.getElementById('editNome').value,
        cpf: document.getElementById('editCpf').value,
        telefone: document.getElementById('editTelefone').value,
        crea: document.getElementById('editCrea').value,
    };
    const { error } = await api.updateUserProfile(userId, data);
    if (error) {
        alert("Erro ao atualizar usuário: " + error.message);
    } else {
        alert("Usuário atualizado com sucesso!");
        ui.closeModal('editUserModalOverlay');
        showAdminPanel();
    }
}

async function handleAdminProjectActions(event) {
    if (event.target.classList.contains('transfer-btn')) {
        const button = event.target;
        const projectId = button.dataset.projectId;
        const newOwnerId = button.previousElementSibling.value;
        const { error } = await api.transferProjectOwner(projectId, newOwnerId);
        if (error) {
            alert("Erro ao transferir obra: " + error.message);
        } else {
            alert("Obra transferida!");
            showManageProjectsPanel();
        }
    }
}

// --- PONTO DE ENTRADA ---
// Ouve as mudanças no estado de autenticação (Login, Logout, Recuperação de Senha)
supabase.auth.onAuthStateChange(async (event, session) => {
    // Esconde todas as telas para começar do zero
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('resetPasswordContainer').style.display = 'none';

    if (event === 'PASSWORD_RECOVERY') {
        ui.showResetPasswordView();
    } else if (session) { // Se existe uma sessão (usuário logado)
        currentUserProfile = await auth.getSession();
        if (currentUserProfile && currentUserProfile.is_approved) {
            ui.showAppView(currentUserProfile);
            const projects = await api.fetchProjects();
            ui.populateProjectList(projects, currentUserProfile.is_admin);
            ui.resetForm(true);
        } else {
            // Se o usuário está logado mas não aprovado (ou perfil não encontrado), desloga
            await auth.signOutUser();
        }
    } else { // Se não há sessão (usuário deslogado)
        ui.showLoginView();
    }
});

main(); // Roda a função main para registrar todos os event listeners dos botões