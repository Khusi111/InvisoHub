from django.contrib import admin
from .models import Account, Client, Company, Invoice, InvoiceItem, Payment, BankDetail, ActivityLog

admin.site.register(Account)
admin.site.register(Client)
admin.site.register(Company)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
admin.site.register(Payment)
admin.site.register(BankDetail)
admin.site.register(ActivityLog)
