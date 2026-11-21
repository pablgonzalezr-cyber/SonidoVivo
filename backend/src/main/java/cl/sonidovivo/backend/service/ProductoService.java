package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.ProductoRequest;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.Locale;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listar() {
        return repository.findAll(Sort.by("codigo"));
    }

    @Transactional(readOnly = true)
    public List<Producto> buscar(
            String texto, String categoria, Integer precioMin,
            Integer precioMax, Boolean disponible, String orden) {

        if (precioMin != null && precioMin < 0 ||
            precioMax != null && precioMax < 0 ||
            precioMin != null && precioMax != null && precioMin > precioMax) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "El rango de precios no es valido.");
        }

        String busqueda = texto == null ? "" : texto.trim().toLowerCase(Locale.ROOT);
        String categoriaFiltrada = categoria == null ? "" : categoria.trim().toLowerCase(Locale.ROOT);
        if (busqueda.length() > 120 || categoriaFiltrada.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Texto o categoria demasiado largos.");
        }

        String ordenElegido = orden == null ? "codigo" : orden.trim();
        Sort ordenamiento = switch (ordenElegido) {
            case "codigo" -> Sort.by("codigo").ascending();
            case "nombre_asc" -> Sort.by("nombre").ascending().and(Sort.by("codigo"));
            case "nombre_desc" -> Sort.by("nombre").descending().and(Sort.by("codigo"));
            case "precio_asc" -> Sort.by("precio").ascending().and(Sort.by("codigo"));
            case "precio_desc" -> Sort.by("precio").descending().and(Sort.by("codigo"));
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Ordenamiento no valido.");
        };

        Specification<Producto> filtros = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();

            if (!busqueda.isEmpty()) {
                String patron = "%" + busqueda + "%";
                condiciones.add(cb.or(
                    cb.like(cb.lower(root.get("nombre")), patron),
                    cb.like(cb.lower(root.get("marca")), patron),
                    cb.like(cb.lower(root.get("modelo")), patron)
                ));
            }
            if (!categoriaFiltrada.isEmpty() && !categoriaFiltrada.equals("todas")) {
                condiciones.add(cb.equal(cb.lower(root.get("categoria")), categoriaFiltrada));
            }
            if (precioMin != null) {
                condiciones.add(cb.ge(root.<Integer>get("precio"), precioMin));
            }
            if (precioMax != null) {
                condiciones.add(cb.le(root.<Integer>get("precio"), precioMax));
            }
            if (Boolean.TRUE.equals(disponible)) {
                condiciones.add(cb.gt(root.<Integer>get("stock"), 0));
            }
            return cb.and(condiciones.toArray(new Predicate[0]));
        };

        return repository.findAll(filtros, ordenamiento);
    }

    @Transactional(readOnly = true)
    public List<String> listarCategorias() {
        return repository.listarCategorias();
    }

    @Transactional(readOnly = true)
    public Producto buscarPorCodigo(String codigo) {
        return repository.findByCodigoIgnoreCase(codigo.trim())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado"
            ));
    }

    @Transactional
    public Producto crear(ProductoRequest datos) {
        String codigo = datos.codigo()
            .trim()
            .toUpperCase(Locale.ROOT);

        if (repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Ya existe un producto con ese codigo"
            );
        }

        Producto nuevo = new Producto(
            codigo,
            datos.categoria().trim(),
            datos.nombre().trim(),
            datos.marca().trim(),
            datos.modelo().trim(),
            datos.stock(),
            datos.precio(),
            limpiarOpcional(datos.descripcion())
        );

        nuevo.setImagen(
            limpiarOpcional(datos.imagen())
        );

        try {
            return repository.saveAndFlush(nuevo);
        } catch (DataIntegrityViolationException error) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se pudo crear el producto: codigo duplicado"
            );
        }
    }

    @Transactional
    public Producto actualizar(
            String codigo,
            ProductoRequest datos) {

        Producto producto = buscarPorCodigo(codigo);

        if (
            !producto.getCodigo().equalsIgnoreCase(
                datos.codigo().trim()
            )
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "No esta permitido cambiar el codigo del producto"
            );
        }

        producto.setCategoria(datos.categoria().trim());
        producto.setNombre(datos.nombre().trim());
        producto.setMarca(datos.marca().trim());
        producto.setModelo(datos.modelo().trim());
        producto.setStock(datos.stock());
        producto.setPrecio(datos.precio());
        producto.setDescripcion(
            limpiarOpcional(datos.descripcion())
        );
        producto.setImagen(
            limpiarOpcional(datos.imagen())
        );

        return repository.saveAndFlush(producto);
    }

    @Transactional
    public Producto actualizarStock(
            String codigo,
            Integer nuevoStock) {

        if (nuevoStock == null || nuevoStock < 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El stock debe ser un entero mayor o igual a cero"
            );
        }

        Producto producto = buscarPorCodigo(codigo);

        producto.setStock(nuevoStock);

        return repository.saveAndFlush(producto);
    }

    @Transactional
    public void eliminar(String codigo) {
        Producto producto = buscarPorCodigo(codigo);
        repository.delete(producto);
    }

    private String limpiarOpcional(String texto) {
        return texto == null ? "" : texto.trim();
    }
}
