// Mapeamento de status -> cor e rotulo em pt-BR
export const STATUS_MAP = {
  planejamento: { label: 'Planejamento', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
  producao: { label: 'Em Produção', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  mixagem: { label: 'Mixagem', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  masterizacao: { label: 'Masterização', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  lancado: { label: 'Lançado', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' },
  pausado: { label: 'Pausado', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30' },
}

export const RELEASE_TYPE_MAP = {
  album: 'Álbum',
  ep: 'EP',
  single: 'Single',
}

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.planejamento
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  )
}