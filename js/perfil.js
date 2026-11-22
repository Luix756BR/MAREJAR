document.addEventListener('DOMContentLoaded', () => {
    carregarDadosPerfil();

    // Configura o evento de envio do formulário de edição
    const formEditar = document.getElementById('formEditarPerfil');
    if (formEditar) {
        formEditar.addEventListener('submit', salvarAlteracoesPerfil);
    }
});

async function carregarDadosPerfil() {
    const token = localStorage.getItem('marejar_token');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'painel_acesso.html';
        return;
    }

    try {
        // Busca os dados atualizados direto do servidor usando o token de autenticação
        const response = await fetch('http://localhost:3001/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar os dados do usuário.');
        }

        const data = await response.json();
        const user = data.user;

        // Atualiza o localStorage com os dados mais recentes
        localStorage.setItem('marejar_user', JSON.stringify(user));

        // Preenche os elementos da tela com os dados reais
        const primeiraLetra = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        
        document.getElementById('userAvatar').textContent = primeiraLetra;
        document.getElementById('userName').textContent = user.name || 'Usuário';
        document.getElementById('userEmail').textContent = user.email || 'Não informado';
        
        let roleTexto = 'Turista / Visitante';
        if (user.role === 'guia') {
            roleTexto = 'Guia Credenciado (Cadastur)';
        }
        document.getElementById('userRole').textContent = roleTexto;

        document.getElementById('userCpf').textContent = user.cpf || 'Não informado';
        document.getElementById('userPhone').textContent = user.phone || 'Não informado';
        document.getElementById('userBirth').textContent = user.birthDate || 'Não informado';
        document.getElementById('userCity').textContent = user.city || 'Não informada';

    } catch (error) {
        console.error('Erro ao processar os dados do usuário:', error);
    }
}

function abrirModalEdicao() {
    // Pega os dados atuais salvos no localStorage
    const userData = localStorage.getItem('marejar_user');
    if (!userData) return;
    
    const user = JSON.parse(userData);

    // Preenche os campos do modal com os valores atuais
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editBirth').value = user.birthDate || '';
    document.getElementById('editCity').value = user.city || '';

    // Abre o modal do Bootstrap
    const modalEl = document.getElementById('editarPerfilModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function salvarAlteracoesPerfil(e) {
    e.preventDefault();

    const token = localStorage.getItem('marejar_token');
    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'painel_acesso.html';
        return;
    }

    const phone = document.getElementById('editPhone').value;
    const birthDate = document.getElementById('editBirth').value;
    const city = document.getElementById('editCity').value;

    try {
        const response = await fetch('http://localhost:3001/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ phone, birthDate, city })
        });

        const resultado = await response.json();

        if (response.ok) {
            alert('Perfil atualizado com sucesso!');
            
            // Fecha o modal
            const modalEl = document.getElementById('editarPerfilModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            
            // Recarrega os dados na tela
            carregarDadosPerfil();
        } else {
            alert('Erro ao atualizar: ' + (resultado.message || 'Erro desconhecido.'));
        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alert('Não foi possível conectar ao servidor.');
    }
}

function fazerLogout() {
    localStorage.removeItem('marejar_token');
    localStorage.removeItem('marejar_user');
    window.location.href = 'index.html';
}