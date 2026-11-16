package cl.sonidovivo.backend.service;

import cl.sonidovivo.backend.dto.ProductoRequest;
import cl.sonidovivo.backend.model.Producto;
import cl.sonidovivo.backend.repository.ProductoRepository;
import java.util.List;
import java.util.Locale;
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
    public Producto buscarPorCodigo(String codigo) {
        return repository.findByCodigoIgnoreCase(codigo.trim())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado"
            ));
    }

    @Transactional
    public Producto crear(ProductoRequest datos) {
        String codigo = datos.codigo().trim().toUpperCase(Locale.ROOT);

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
        nuevo.setImagen(limpiarOpcional(datos.imagen()));

        try {
            return repository.saveAndFlush(nuevo);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se pudo crear el producto: codigo duplicado"
            );
        }
    }

    @Transactional
    public Producto actualizar(String codigo, ProductoRequest datos) {
        Producto producto = buscarPorCodigo(codigo);

        if (!producto.getCodigo().equalsIgnoreCase(datos.codigo().trim())) {
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
        producto.setDescripcion(limpiarOpcional(datos.descripcion()));
        producto.setImagen(limpiarOpcional(datos.imagen()));

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

