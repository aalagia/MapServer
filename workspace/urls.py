from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView
from rest_framework.urlpatterns import format_suffix_patterns
from MapSVG import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Examples:
    # url(r'^$', 'workspace.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^maplist/$', views.map_list),
    url(r'^map/$', views.download_map),
    url(r'^map/(?P<filename>.*)$', views.download_map),
    url(r'^document/$', views.map_request),
    url(r'^document/(?P<idMappa>[a-zA-Z0-9]+)$', views.map_request),
    url(r'^beaconData/$', views.beacon_data),
    url(r'^beaconData/(?P<idMappa>[a-zA-Z0-9]+)$', views.beacon_data),
    url(r'^download/$', views.download_file),
    url(r'^download/(?P<filename>.*)$', views.download_file),
    url(r'^', TemplateView.as_view(template_name='SpinMap2.html')),
    #url(r'^/$', views.simple_html_view),
    # url(r'^download/(?P<file_name>[a-zA-Z0-9]+)$', views.download_file)

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns = format_suffix_patterns(urlpatterns)


