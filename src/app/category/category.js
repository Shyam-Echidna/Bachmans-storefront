angular.module( 'orderCloud' )

	.config( CategoryConfig )
	.factory( 'CategoryService', CategoryService)
	.controller( 'CategoryCtrl', CategoryController )

;

function CategoryConfig( $stateProvider ) {
	$stateProvider
		.state( 'category', {
			parent: 'base',
			url: '/category/:childCount/:ID',
			/*params: {
		    childCount:null,
		    ID:null
		    
		  },*/
		  	resolve: {

	  		categoryImages: function(CategoryService){
			var ticket = localStorage.getItem("alf_ticket");
			return CategoryService.GetCategoryImages(ticket).then(function(res){
				return res.items;
			});
		},
			
			Tree: function( CategoryService,$stateParams,$state,$timeout) {
				if(parseInt($stateParams.childCount) != 0){
				return CategoryService.listChild($stateParams.ID);
			}
			else{


				$timeout(function(){
				$state.go('plp', {catId: $stateParams.ID});
				},10);

			}
			}
		},
			templateUrl: 'category/templates/category.tpl.html',
			controller: 'CategoryCtrl',
			controllerAs: 'category'
		})
}

function CategoryService( $rootScope, $q, $localForage, Underscore, $http, OrderCloud, alfrescourl) {
	var service = {		
		
		GetCategoryTree: _getCategoryTree,
		listChild:_listChild,
		GetCategoryBanner:_getCategoryBanner,
		GetPromotions:_getPromotions,
		GetBestSellerProducts:_getBestSellerProducts,
		GetQuickLinks:_getQuickLinks,
		GetCategoryImages:_getCategoryImages,
		GetGridImgs:_getGridImgs
	};
		//console.log("categoryImages 60===",categoryImages);	
		function _getCategoryTree() {
		
		var deferred = $q.defer();
	 OrderCloud.Categories.List().then(function(list) {

					deferred.resolve(list.Items);
		});
		return deferred.promise;
	}

	function _listChild(parentId){
		var tree = [];
		var deferred = $q.defer();
	OrderCloud.Categories.ListChildren(parentId, null, 'all', 1, 100).then(function(list) {
			console.log(list);
			 function _getnode(node) {
                
                var children = Underscore.where(list.Items, { ParentID: node.ID});

                if (children.length > 0) {
                    node.children = children;
                    angular.forEach(children, function(child) {
                        return _getnode(child);
                    });
                } else {
                    node.children = [];
                }
                return node;
            }

            angular.forEach(Underscore.where(list.Items, { ParentID: parentId}), function(node) {
                tree.push(_getnode(node));
            });
	
			deferred.resolve(tree);
		});
		return deferred.promise;

	}
	function _getCategoryBanner(ticket) {
		var defferred = $q.defer(); 
		$http({
			method: 'GET',
			dataType:"json",
			url: alfrescourl+"CategoryPage/Banner?alf_ticket="+ticket,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {              
			defferred.resolve(data);
		}).error(function (data, status, headers, config) {
			defferred.reject(data);
		});
		return defferred.promise;
	}

		function _getPromotions(ticket) {
		var defferred = $q.defer(); 
		$http({
			method: 'GET',
			dataType:"json",
			url: alfrescourl+"CategoryPage/Promotions?alf_ticket="+ticket,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {              
			defferred.resolve(data);
		}).error(function (data, status, headers, config) {
			defferred.reject(data);
		});
		return defferred.promise;
	}

	function _getBestSellerProducts(){
     // var defferred = $q.defer(); 
     
		var filter ={
        "xp.BestSeller":true
    };
     var defferred = $q.defer(); 
     OrderCloud.Me.ListProducts(null, 1, 100, null, null, filter, null).then(function(res){
     	console.log("462==",res);
     	defferred.resolve(res.Items);
     })
		
		return defferred.promise;
}
		function _getQuickLinks(ticket) {
		var defferred = $q.defer(); 
		$http({
			method: 'GET',
			dataType:"json",
			url: alfrescourl+"CategoryPage/QuickLinks?alf_ticket="+ticket,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {              
			defferred.resolve(data);
		}).error(function (data, status, headers, config) {
			defferred.reject(data);
		});
		return defferred.promise;
	}
	function _getGridImgs(ticket) {
		var defferred = $q.defer(); 
		$http({
			method: 'GET',
			dataType:"json",
			url: alfrescourl+"CategoryPage/GridSystem?alf_ticket="+ticket,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {              
			defferred.resolve(data);
		}).error(function (data, status, headers, config) {
			defferred.reject(data);
		});
		return defferred.promise;
	}
	 function _getCategoryImages(ticket) {
		var defferred = $q.defer(); 
		$http({
			method: 'GET',
			dataType:"json",
			url: alfrescourl+"Media/category?alf_ticket="+ticket,

			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {              
			defferred.resolve(data);
		}).error(function (data, status, headers, config) {
			defferred.reject(data);
		});
		return defferred.promise;
	}
	return service;

	}
function CategoryController(OrderCloud, Tree, CategoryService, PlpService, $q, Underscore,$scope, $window, $sce, alfcontenturl, categoryImages) {
	var ticket = localStorage.getItem("alf_ticket");
	var vm = this;
	/*vm.categoryTree = Tree;
	console.log("tree ==", Tree);
	console.log("categoryImages==",categoryImages);
	*/
	var arr = [];
for(var i=0;i<Tree.length;i++){
  ss(i);
}
function ss(i){
 var filt = _.filter(categoryImages, function(row){
   if(Tree[i].ID==row.title){
     return _.indexOf([Tree[i].ID],row.title) > -1;
    }
 });
  if(filt.length>0){
    filt[0].contentUrl = alfcontenturl+filt[0].contentUrl+"?alf_ticket="+ticket;
    Tree[i].imgContent = filt[0];
    arr.push(Tree[i]);
  }
}
if(arr.length>0){
	
	vm.categoryList = arr;
}
else{
	vm.categoryList = Tree;
}
function EventsList(){
		var ajaxarr = [];
		  CategoryService.listChild("c10").then(function(catList) {

         angular.forEach(catList, function(cat) {
       //  var promise = OrderCloud.Me.ListProducts(cat.ID);
          var promise =  OrderCloud.Me.ListProducts(null, 1, 100, null, null, null, cat.ID).then(function(res){
          	return res.Items
          })
         	ajaxarr.push(promise);
         });
          
           $q.all(ajaxarr).then(function(items){
		   
		   	console.log("events===",Underscore.flatten(items));
		   	vm.eventsList = Underscore.flatten(items);
		   	setTimeout(function(){
				var owl = angular.element("#owl-carousel-events");	
				owl.owlCarousel({
					items:2,
					center:false,
					loop: false,
					nav:true,
					//navText: ['<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>','<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>'],
					navText: ['<span class="events-arrow-prev" aria-hidden="true"></span>','<span class="events-arrow-next" aria-hidden="true"></span>'],
					autoWidth:true,
					//responsive: true,
					responsive : {
						0 : {
							/*stagePadding:30,*/
							margin:30
						},
						320 : {
							/*stagePadding:50,*/
							margin:5
						},
						560 : {
							/*stagePadding:50,*/
							margin:10
						},
						768 : {
							/*stagePadding:30,*/
							margin:20
						}
					},
					onInitialized : function(event){
						console.log("owl==",owl.find('.owl-item.active').last());
						owl.find('.owl-item.active').last().addClass('fadeGrid');
					}
				});
				owl.on('changed.owl.carousel', function(event) {
					setTimeout(function(){
						console.log("owl==",owl.find('.owl-item.active'));
						owl.find('.owl-item').removeClass('fadeGrid');
						owl.find('.owl-item.active').last().addClass('fadeGrid');

					},100);
				})
			},1000)
		   });
       });
		   }

	function EventsList1(){

			 var ajaxarr = [];
        CategoryService.listChild("c10").then(function(catList) {
         angular.forEach(catList, function(cat) {
          var promise = PlpService.GetProductAssign(cat.ID);
          ajaxarr.push(promise);
          });
       $q.all(ajaxarr).then(function(items){
         	
         	var productArr = Underscore.flatten(items); 	

			var ajaxarr1 = [];
			for(var i=0;i<productArr.length;i++){
					var promise = PlpService.ProductList(productArr[i].ProductID).then(function(data){
				
					return PlpService.GetStandardPriceScheduleID(data);
         

				});
					ajaxarr1.push(promise);	
			}
			
			 $q.all(ajaxarr1).then(function(items){
			vm.eventsList = items;
			setTimeout(function(){
				var owl = angular.element("#owl-carousel-events");	
				owl.owlCarousel({
					items:2,
					center:false,
					loop: false,
					nav:true,
					//navText: ['<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>','<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>'],
					navText: ['<span class="events-arrow-prev" aria-hidden="true"></span>','<span class="events-arrow-next" aria-hidden="true"></span>'],
					autoWidth:true,
					//responsive: true,
					responsive : {
						0 : {
							/*stagePadding:30,*/
							margin:30
						},
						320 : {
							/*stagePadding:50,*/
							margin:5
						},
						560 : {
							/*stagePadding:50,*/
							margin:10
						},
						768 : {
							/*stagePadding:30,*/
							margin:20
						}
					},
					onInitialized : function(event){
						console.log("owl==",owl.find('.owl-item.active').last());
						owl.find('.owl-item.active').last().addClass('fadeGrid');
					}
				});
				owl.on('changed.owl.carousel', function(event) {
					setTimeout(function(){
						console.log("owl==",owl.find('.owl-item.active'));
						owl.find('.owl-item').removeClass('fadeGrid');
						owl.find('.owl-item.active').last().addClass('fadeGrid');

					},100);
				})
			},1000)
	

		});
		});
        })

		}

	EventsList();
	/*var $grid = $('.clp-grid').masonry({
	  itemSelector: '.clp-grid-item',
	  percentPosition: true,
	  columnWidth: '.grid-sizer',
	  gutter: 10

	});
	// layout Isotope after each image loads
	$grid.imagesLoaded().progress( function() {
	  $grid.masonry();
	});  */
	
	// static masonry
	
	/*if($(window).width() <= 768){
		$(".clp-grid-item:nth-child(1) .mobile-img").load(function(){
			var inspHtClp = $(this).height();		

			$('.clp-repeatable-blocks').css('height', inspHtClp*2 + inspHtClp/2 + 5);
			
			$('.clp-grid-item:nth-child(1)').css({'height': inspHtClp, 'border':'none'});
			$('.clp-grid-item:nth-child(2)').css('height', inspHtClp/2);
			$('.clp-grid-item:nth-child(3)').css({'height': inspHtClp + inspHtClp/2, 'top': inspHtClp + 5 });
			$('.clp-grid-item:nth-child(4)').css({'height': inspHtClp/2, 'top': inspHtClp/2});
			
		});
	}
	else{
		$(".clp-grid-item:nth-child(1) .desktop-img").load(function(){
			var inspHtClp = $(this).height();	

			$('.clp-repeatable-blocks').css('height', inspHtClp );
			
			$('.clp-grid-item:nth-child(1)').css({'height': inspHtClp, 'border':'none'});
			$('.clp-grid-item:nth-child(2)').css('height', inspHtClp/2);
			$('.clp-grid-item:nth-child(3)').css('height', inspHtClp);
			$('.clp-grid-item:nth-child(4)').css({'height': inspHtClp/2, 'top': inspHtClp/2 });
			
			
		});
	}*/
	
	var owl = angular.element("#owl-carousel");	
	owl.owlCarousel({
		//responsive: true,
		items:1,
		loop:true,
		nav:true,
		margin:20,
		stagePadding:280,
		autoWidth:true
	});
	

	PlpService.GetProductImages(ticket).then(function(res){
				var  productImages = res.items;
	CategoryService.GetBestSellerProducts().then(function(res){
     var ticket = localStorage.getItem("alf_ticket");      
        var imgcontent;
      for(var i=0;i<res.length;i++){
      	angular.forEach(Underscore.where(productImages, {title: res[i].ID}), function (node) {
            node.contentUrl = alfcontenturl + node.contentUrl + "?alf_ticket=" + ticket;
            imgcontent = node;
        });
        res[i].imgContent = imgcontent;
       
      }
      vm.bestSeller = res;
    	setTimeout(function(){
      	var owl2 = angular.element("#owl-carousel2");	
		owl2.owlCarousel({
			//responsive: true,
			loop:true,
			nav:true,
			responsive:{
				0:{ items:1 },
				320:{
					items:2,
				},
				730 :{ 
					items:3,
				},
				1024:{ 
					items:4
				}
			}
		});
		},1000)
       
	 });
	});
	CategoryService.GetCategoryBanner(ticket).then(function(res){
    vm.categoryBanner_ctg_banner = alfcontenturl+res.items[0].contentUrl+"?alf_ticket="+ticket;
	    vm.categoryBanner_ctg_bannerTitle = res.items[0].title;
		vm.categoryBanner_ctg_bannerDescription = res.items[0].description;
    
 });
	CategoryService.GetPromotions(ticket).then(function(res){
    vm.cat_artcle = alfcontenturl+res.items[0].contentUrl+"?alf_ticket="+ticket;
    vm.cat_info = alfcontenturl+res.items[2].contentUrl+"?alf_ticket="+ticket;
    vm.cat_slot1 = alfcontenturl+res.items[3].contentUrl+"?alf_ticket="+ticket;    
    vm.cat_slot2 = alfcontenturl+res.items[4].contentUrl+"?alf_ticket="+ticket;
    
    vm.cat_slot1Title = res.items[3].title;
	vm.cat_slot1Description = res.items[3].description;
	vm.cat_slot1BtnTxt = res.items[3].author;

	vm.cat_slot2Title = res.items[4].title;
	vm.cat_slot2Description = res.items[4].description;
	vm.cat_slot2BtnTxt = res.items[4].author;

	vm.cat_artcleTitle = res.items[0].title;
	vm.cat_artcleDescription = res.items[0].description;
	vm.cat_artcleBtnTxt = res.items[0].author;

	var cat_article_content = alfcontenturl + res.items[1].contentUrl + "?alf_ticket=" + ticket;
	vm.cat_article_content = $sce.trustAsResourceUrl(cat_article_content);

	var cat_slot_info_bottomDesign = alfcontenturl + res.items[5].contentUrl + "?alf_ticket=" + ticket;
	vm.cat_slot_info_bottomDesign = $sce.trustAsResourceUrl(cat_slot_info_bottomDesign);

	var cat_slot_info_topDesign = alfcontenturl + res.items[6].contentUrl + "?alf_ticket=" + ticket;
	vm.cat_slot_info_topDesign = $sce.trustAsResourceUrl(cat_slot_info_topDesign);
    
 });
	
	CategoryService.GetGridImgs(ticket).then(function(res){
					var gridImgs;
		vm.gridImgs = [];
		angular.forEach(res.items, function(item,key){
			gridImgs=alfcontenturl+item.contentUrl+"?alf_ticket="+ticket;
			vm.gridImgs.push(gridImgs);
		});

		vm.topGridImg = alfcontenturl+res.items[0].contentUrl+"?alf_ticket="+ticket;
		vm.topGridTitle = res.items[0].title;
		vm.topGridDescription = res.items[0].description;
		vm.topGridBtnTxt = res.items[0].author;
			});
	
	CategoryService.GetQuickLinks(ticket).then(function(res){
	vm.quicklinks = [];
		vm.title = [];
		vm.desc = [];
		angular.forEach(res.items, function(item,key){
		
		var quicklink = $sce.trustAsResourceUrl(alfcontenturl+item.contentUrl+"?alf_ticket="+ticket);
		
		var title  = item.title;
		var desc = item.description;
		vm.quicklinks.push(quicklink);
		vm.title.push(title);
		vm.desc.push(desc);
	})
			var quicklinkPP = alfcontenturl + res.items[3].contentUrl + "?alf_ticket=" + ticket;
			vm.quicklinkPP = $sce.trustAsResourceUrl(quicklinkPP);
			var quicklinkPPHover = alfcontenturl + res.items[4].contentUrl + "?alf_ticket=" + ticket;
			vm.quicklinkPPHover = $sce.trustAsResourceUrl(quicklinkPPHover);
	    
});
}
