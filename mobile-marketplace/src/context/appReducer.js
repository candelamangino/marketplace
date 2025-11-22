import { servicesMock } from '../data/servicesMock'
import { quotesMock } from '../data/quotesMock'
import { suppliesMock } from '../data/suppliesMock'
import { supplyOffersMock } from '../data/supplyOffersMock'

/**
 * Estado inicial de la aplicación
 * 
 * Aquí se cargan todos los datos mock al inicio.
 * En una app real, estos datos vendrían de una API.
 */
export const initialState = {
  currentUser: null, // Usuario logueado actualmente
  services: servicesMock,
  quotes: quotesMock,
  supplies: suppliesMock,
  supplyOffers: supplyOffersMock
}

/**
 * Reducer para manejar todas las acciones del estado global
 * 
 * Un reducer es una función pura que recibe:
 * - state: el estado actual
 * - action: un objeto con { type: 'TIPO_ACCION', payload: datos }
 * 
 * Y retorna el nuevo estado según el tipo de acción.
 * 
 * ¿Por qué usar reducer en vez de solo useState?
 * - Cuando el estado es complejo (muchas propiedades relacionadas)
 * - Cuando hay muchas acciones que modifican el estado
 * - Para centralizar la lógica de actualización del estado
 * - Facilita el debugging (puedes ver todas las acciones que ocurrieron)
 */
export const appReducer = (state, action) => {
  switch (action.type) {
    // Acción para cuando un usuario inicia sesión
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        currentUser: action.payload // Guardamos el usuario logueado
      }

    // Acción para cerrar sesión
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null // Limpiamos el usuario
      }

    // Crear un nuevo servicio
    case 'CREATE_SERVICE':
      return {
        ...state,
        services: [...state.services, action.payload]
      }

    // Actualizar un servicio existente
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.id
            ? { ...service, ...action.payload }
            : service
        )
      }

    // Cambiar el estado de un servicio (PUBLICADO, EN_EVALUACION, etc.)
    case 'UPDATE_SERVICE_STATUS':
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.serviceId
            ? { ...service, estado: action.payload.estado }
            : service
        )
      }

    // Crear una nueva cotización
    case 'CREATE_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload],
        // También actualizamos el servicio para agregar la cotización
        services: state.services.map(service =>
          service.id === action.payload.serviceId
            ? {
                ...service,
                cotizacionesIds: [...service.cotizacionesIds, action.payload.id]
              }
            : service
        )
      }

    // Actualizar una cotización
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote =>
          quote.id === action.payload.id
            ? { ...quote, ...action.payload }
            : quote
        )
      }

    // Eliminar una cotización
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter(quote => quote.id !== action.payload),
        // También la removemos del servicio
        services: state.services.map(service => ({
          ...service,
          cotizacionesIds: service.cotizacionesIds.filter(
            id => id !== action.payload
          )
        }))
      }

    // Crear un nuevo insumo
    case 'CREATE_SUPPLY':
      return {
        ...state,
        supplies: [...state.supplies, action.payload]
      }

    // Actualizar un insumo
    case 'UPDATE_SUPPLY':
      return {
        ...state,
        supplies: state.supplies.map(supply =>
          supply.id === action.payload.id
            ? { ...supply, ...action.payload }
            : supply
        )
      }

    // Crear una oferta de pack de insumos
    case 'CREATE_SUPPLY_OFFER':
      return {
        ...state,
        supplyOffers: [...state.supplyOffers, action.payload]
      }

    // Actualizar una oferta de pack de insumos existente
    case 'UPDATE_SUPPLY_OFFER':
      return {
        ...state,
        supplyOffers: state.supplyOffers.map(offer =>
          offer.id === action.payload.id
            ? { ...offer, ...action.payload }
            : offer
        )
      }

    // Eliminar una oferta de pack de insumos
    case 'DELETE_SUPPLY_OFFER':
      return {
        ...state,
        supplyOffers: state.supplyOffers.filter(offer => offer.id !== action.payload)
      }

    // Seleccionar una cotización para un servicio
    // Esto cambia el estado del servicio a ASIGNADO
    case 'SELECT_QUOTE_FOR_SERVICE':
      const { serviceId, quoteId } = action.payload
      return {
        ...state,
        services: state.services.map(service =>
          service.id === serviceId
            ? {
                ...service,
                estado: 'ASIGNADO',
                cotizacionSeleccionadaId: quoteId
              }
            : service
        ),
        quotes: state.quotes.map(quote =>
          quote.id === quoteId
            ? { ...quote, estado: 'ACEPTADA' }
            : quote.id !== quoteId && quote.serviceId === serviceId
            ? { ...quote, estado: 'RECHAZADA' }
            : quote
        )
      }

    // Si no reconocemos la acción, retornamos el estado sin cambios
    default:
      return state
  }
}

