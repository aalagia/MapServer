from django.conf.urls import include, url
from django.contrib import admin
from rest_framework.urlpatterns import format_suffix_patterns
from MapSVG import views

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
    #url(r'^download/(?P<file_name>[a-zA-Z0-9]+)$', views.download_file)

]

urlpatterns = format_suffix_patterns(urlpatterns)

