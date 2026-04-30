import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import { Table, Td, Th, Tr } from "../../components/ui/Table";

export function ArtistManagementTable({ artists, onEdit, onDelete }) {
  if (!artists.length) {
    return (
      <div className="bg-card border border-edge rounded p-8 text-center text-ink-dim">
        Belum ada artis. Klik "Tambah Artis" untuk memulai.
      </div>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>ID</Th>
          <Th>Nama</Th>
          <Th>Genre</Th>
          <Th className="w-30">Action</Th>
        </tr>
      </thead>
      <tbody>
        {artists.map((artist) => (
          <Tr key={artist.id}>
            <Td className="font-mono text-[11px] text-ink-dim">{artist.id}</Td>
            <Td>
              <strong>{artist.name}</strong>
            </Td>
            <Td>
              <span className="chip-primary">{artist.genre || "-"}</span>
            </Td>
            <Td>
              <div className="flex items-center gap-2">
                <IconButton icon={<Pencil size={16} />} onClick={() => onEdit(artist)} />
                <IconButton
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => onDelete(artist)}
                />
              </div>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
