import { create } from 'zustand'

export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface HeldSale {
  id: string
  saleNumber: string
  items: CartItem[]
  subtotal: number
  taxAmount: number
  igtfAmount: number
  totalAmount: number
  heldAt: string
  customerName?: string
}

interface PosState {
  activeTab: string
  setActiveTab: (tab: string) => void

  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Totals
  discountPercent: number
  setDiscountPercent: (percent: number) => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getIgtfAmount: () => number
  getDiscountAmount: () => number
  getTotalAmount: () => number

  // Category filter
  selectedCategory: string | null
  setSelectedCategory: (categoryId: string | null) => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Held sales
  heldSales: HeldSale[]
  holdCurrentSale: () => void
  resumeSale: (saleId: string) => void
  removeHeldSale: (saleId: string) => void

  // Payment
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  customerName: string
  setCustomerName: (name: string) => void

  // Cash register
  cashRegisterOpen: boolean
  cashRegisterId: string | null
  setCashRegister: (isOpen: boolean, id: string | null) => void

  // Mobile cart drawer
  mobileCartOpen: boolean
  setMobileCartOpen: (open: boolean) => void
}

export const usePosStore = create<PosState>((set, get) => ({
  activeTab: 'sales',
  setActiveTab: (tab) => set({ activeTab: tab }),

  cart: [],
  addToCart: (item) => {
    const { cart } = get()
    const existing = cart.find((c) => c.productId === item.productId)
    if (existing) {
      set({
        cart: cart.map((c) =>
          c.productId === item.productId
            ? { ...c, quantity: c.quantity + item.quantity, total: (c.quantity + item.quantity) * c.unitPrice }
            : c
        ),
      })
    } else {
      set({ cart: [...cart, item] })
    }
  },
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((c) => c.productId !== productId) })
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }
    set({
      cart: get().cart.map((c) =>
        c.productId === productId ? { ...c, quantity, total: quantity * c.unitPrice } : c
      ),
    })
  },
  clearCart: () => set({ cart: [], discountPercent: 0, customerName: '', paymentMethod: 'cash' }),

  discountPercent: 0,
  setDiscountPercent: (percent) => set({ discountPercent: percent }),

  getSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.total, 0)
  },
  getTaxAmount: () => {
    return get().getSubtotal() * 0.16
  },
  getIgtfAmount: () => {
    return get().getSubtotal() * 0.03
  },
  getDiscountAmount: () => {
    return get().getSubtotal() * (get().discountPercent / 100)
  },
  getTotalAmount: () => {
    const subtotal = get().getSubtotal()
    const tax = get().getTaxAmount()
    const igtf = get().getIgtfAmount()
    const discount = get().getDiscountAmount()
    return subtotal + tax + igtf - discount
  },

  selectedCategory: null,
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  heldSales: [],
  holdCurrentSale: () => {
    const { cart, heldSales, getSubtotal, getTaxAmount, getIgtfAmount, getTotalAmount, customerName } = get()
    if (cart.length === 0) return
    const held: HeldSale = {
      id: crypto.randomUUID(),
      saleNumber: `HELD-${Date.now()}`,
      items: [...cart],
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      igtfAmount: getIgtfAmount(),
      totalAmount: getTotalAmount(),
      heldAt: new Date().toISOString(),
      customerName: customerName || undefined,
    }
    set({ heldSales: [...heldSales, held], cart: [], discountPercent: 0, customerName: '' })
  },
  resumeSale: (saleId) => {
    const { heldSales } = get()
    const sale = heldSales.find((s) => s.id === saleId)
    if (sale) {
      set({
        cart: sale.items,
        heldSales: heldSales.filter((s) => s.id !== saleId),
        customerName: sale.customerName || '',
      })
    }
  },
  removeHeldSale: (saleId) => {
    set({ heldSales: get().heldSales.filter((s) => s.id !== saleId) })
  },

  paymentMethod: 'cash',
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  customerName: '',
  setCustomerName: (name) => set({ customerName: name }),

  cashRegisterOpen: false,
  cashRegisterId: null,
  setCashRegister: (isOpen, id) => set({ cashRegisterOpen: isOpen, cashRegisterId: id }),

  mobileCartOpen: false,
  setMobileCartOpen: (open) => set({ mobileCartOpen: open }),
}))
