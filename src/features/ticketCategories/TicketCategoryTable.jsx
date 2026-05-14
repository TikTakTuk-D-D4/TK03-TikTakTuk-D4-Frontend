import { Search, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table, Td, Th, Tr } from "../../components/ui/Table";

function rupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export function TicketCategoryTable({
  categories,
  events,
  showActions,
  canManageRow = () => false,
  onEdit,
  onDelete,
  search,
  onSearch,
  eventFilter,
  onEventFilter,
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_280px] mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            className="pl-9"
            placeholder="Cari nama kategori atau event..."
          />
        </div>

        <Select value={eventFilter} onChange={(event) => onEventFilter(event.target.value)}>
          <option value="">Semua Event</option>
          {events.map((eventItem) => (
            <option key={eventItem.id} value={eventItem.id}>
              {eventItem.name}
            </option>
          ))}
        </Select>
      </div>

      {!categories.length ? (
        <div className="bg-card border border-edge rounded p-8 text-center text-ink-dim">
          Tidak ada kategori yang cocok dengan filter saat ini.
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Event</Th>
              <Th>Nama Kategori</Th>
              <Th>Harga</Th>
              <Th>Kuota</Th>
              {showActions ? <Th className="w-35">Action</Th> : null}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <Tr key={category.id}>
                <Td className="font-mono text-[11px] text-ink-dim" title={category.id}>
                  {category.id.slice(0, 8)}…
                </Td>
                <Td>{category.eventName}</Td>
                <Td>
                  <strong>{category.name}</strong>
                </Td>
                <Td>{rupiah(category.price)}</Td>
                <Td>{Number(category.quota).toLocaleString("id-ID")}</Td>
                {showActions ? (
                  <Td>
                    {canManageRow(category) ? (
                      <div className="flex items-center gap-2">
                        <IconButton icon={<Pencil size={16} />} onClick={() => onEdit(category)} />
                        <IconButton
                          danger
                          icon={<Trash2 size={16} />}
                          onClick={() => onDelete(category)}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-ink-mute">Hanya baca</span>
                    )}
                  </Td>
                ) : null}
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
