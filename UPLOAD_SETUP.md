# Configuração de Upload de Imagens - Flower

Este documento descreve como configurar o Supabase Storage para permitir upload direto de imagens do dispositivo nas funcionalidades de lembranças e fotos polaroid.

## Alterações Realizadas

### 1. Novo Arquivo Utilitário: `src/utils/imageUpload.ts`

Este arquivo contém funções para gerenciar uploads de imagens:

- **`uploadImageToStorage(file, bucket, profileId)`**: Faz upload de uma imagem para o Supabase Storage
  - Valida o tipo de arquivo (JPEG, PNG, WebP, GIF)
  - Valida o tamanho máximo (5MB)
  - Retorna a URL pública da imagem

- **`deleteImageFromStorage(bucket, filePath)`**: Deleta uma imagem do Supabase Storage

- **`isSupabaseStorageUrl(url)`**: Verifica se uma URL é do Supabase Storage

### 2. Modificações em `src/components/MemoriesTab.tsx`

- Adicionado input de arquivo para seleção de imagens do dispositivo
- Mantida compatibilidade com links externos (Google Drive, Dropbox, etc.)
- Interface com dois modos: upload direto ou colar link
- Indicador visual de upload em progresso

### 3. Modificações em `src/components/ProfilePhotosGallery.tsx`

- Adicionado botão para selecionar foto do dispositivo
- Mantida compatibilidade com links externos
- Interface com dois modos: upload direto ou colar link
- Indicador visual de upload em progresso

## Configuração do Supabase Storage

### Passo 1: Criar os Buckets

1. Acesse o Supabase Dashboard do seu projeto
2. Vá para **Storage** > **Buckets**
3. Crie dois novos buckets públicos:
   - **Nome**: `memories` (para imagens de lembranças)
   - **Nome**: `photos` (para fotos polaroid)
4. Configure ambos como **públicos** para permitir leitura sem autenticação

### Passo 2: Executar Script SQL

1. Vá para **SQL Editor** no Supabase Dashboard
2. Crie uma nova query
3. Copie e cole o conteúdo do arquivo `supabase_storage_setup.sql`
4. Execute a query

Este script irá:
- Criar os buckets se não existirem
- Configurar as políticas de acesso (RLS) para Storage
- Permitir upload apenas para usuários autenticados
- Permitir leitura pública das imagens

### Passo 3: Configurar Variáveis de Ambiente

As variáveis de ambiente já devem estar configuradas no seu `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Fluxo de Upload

### Lembranças

1. Clique em **"✨ Adicionar Lembrança"**
2. Preencha os dados (título, descrição, data, etc.)
3. Na seção **"Imagem da Lembrança"**:
   - Clique em **"📸 Selecionar do Dispositivo"** para fazer upload
   - OU cole um link na alternativa abaixo
4. Veja a prévia da imagem em tempo real
5. Clique em **"Criar Registros"** para salvar

### Fotos Polaroid

1. Na seção **"Mural de Polaroids"**
2. Preencha **"Quem registrou?"**
3. Clique em **"📸 Selecionar Foto"** para fazer upload do dispositivo
4. OU cole um link na alternativa abaixo
5. Veja a prévia em tempo real
6. Clique em **"Adicionar Polaroid"** para salvar

## Limitações

- **Tamanho máximo**: 5MB por imagem
- **Formatos suportados**: JPEG, PNG, WebP, GIF
- **Limite de fotos**: 5 polaroids por casal (limite do banco de dados)
- **Limite de lembranças**: Sem limite de quantidade

## Tratamento de Erros

Se você encontrar erros durante o upload:

1. **"Tipo de arquivo inválido"**: Use apenas JPEG, PNG, WebP ou GIF
2. **"Arquivo muito grande"**: Reduza o tamanho da imagem (máximo 5MB)
3. **"Erro ao fazer upload"**: Verifique sua conexão com a internet
4. **"Resposta de upload inválida"**: Tente novamente; pode ser um erro temporário

## Compatibilidade com Links Existentes

O aplicativo mantém total compatibilidade com links externos:

- Links do Google Drive
- Links do Dropbox
- Links do Imgur
- Links do Pinterest
- Qualquer URL HTTP/HTTPS válida

Você pode misturar imagens enviadas do dispositivo com links externos na mesma galeria.

## Segurança

- Todas as imagens são validadas no cliente antes do upload
- O Supabase Storage aplica validação adicional no servidor
- As imagens são armazenadas em buckets públicos, mas apenas usuários autenticados podem fazer upload
- As URLs das imagens são armazenadas no banco de dados com validação de segurança

## Próximos Passos

Se precisar de funcionalidades adicionais:

1. **Edição de imagens**: Implemente um editor de imagens antes do upload
2. **Compressão**: Adicione compressão automática de imagens
3. **Miniaturas**: Gere miniaturas para melhor performance
4. **Galeria avançada**: Implemente visualização em tela cheia

---

**Última atualização**: 2026-06-17
